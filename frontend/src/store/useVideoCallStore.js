import { create } from "zustand";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "./useAuthStore";

// ICE servers configuration for WebRTC
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const useVideoCallStore = create((set, get) => ({
  // Call state
  callStatus: "idle", // idle | calling | incoming | connecting | connected
  caller: null,
  callee: null,

  // Media streams
  localStream: null,
  remoteStream: null,

  // WebRTC
  peerConnection: null,
  iceCandidateQueue: [], // Queue for ICE candidates received before peer connection is ready

  // UI controls
  isVideoEnabled: true,
  isAudioEnabled: true,

  // Call timing
  callStartTime: null,

  // Get user media (camera + microphone)
  getUserMedia: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      set({ localStream: stream });
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Camera/microphone access denied. Please allow permissions.");
      } else if (error.name === "NotFoundError") {
        toast.error("No camera or microphone found.");
      } else {
        toast.error("Failed to access camera/microphone.");
      }
      return null;
    }
  },

  // Create peer connection
  createPeerConnection: () => {
    const { localStream, peerConnection: existingPc } = get();
    const socket = getSocket();

    // If we already have a peer connection, return it
    if (existingPc) {
      return existingPc;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn("createPeerConnection called without localStream");
    }

    // Handle incoming tracks (remote stream)
    pc.ontrack = (event) => {
      console.log("ontrack event received:", event.streams);
      if (event.streams && event.streams[0]) {
        set({ remoteStream: event.streams[0] });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const { caller, callee } = get();
        // If we have callee set, we are the caller, so send to callee
        // If we have caller set, we are the callee, so send to caller
        const remoteUserId = callee?._id || caller?._id;

        if (remoteUserId && socket) {
          socket.emit("call:ice-candidate", {
            candidate: event.candidate,
            remoteUserId,
          });
        }
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        set({ callStatus: "connected", callStartTime: Date.now() });
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        get().endCall();
      }
    };

    set({ peerConnection: pc });
    return pc;
  },

  // Initiate a call
  initiateCall: async (callee) => {
    const socket = getSocket();
    if (!socket) {
      toast.error("Connection error. Please refresh the page.");
      return;
    }

    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("You must be logged in to make a call.");
      return;
    }

    set({ callStatus: "calling", callee });

    // Get media first
    const stream = await get().getUserMedia();
    if (!stream) {
      set({ callStatus: "idle", callee: null });
      return;
    }

    // Emit call initiation to server
    socket.emit("call:initiate", {
      calleeId: callee._id,
      caller: {
        _id: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic,
      },
    });
  },

  // Handle incoming call
  handleIncomingCall: (caller) => {
    set({ callStatus: "incoming", caller });
  },

  // Accept incoming call
  acceptCall: async () => {
    const { caller } = get();
    const socket = getSocket();

    if (!socket || !caller) return;

    // Get media
    const stream = await get().getUserMedia();
    if (!stream) {
      get().rejectCall();
      return;
    }

    set({ callStatus: "connecting" });

    // Notify caller that call was accepted
    socket.emit("call:accept", { callerId: caller._id });
  },

  // Reject incoming call
  rejectCall: () => {
    const { caller, localStream } = get();
    const socket = getSocket();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (socket && caller) {
      socket.emit("call:reject", { callerId: caller._id });
    }

    set({
      callStatus: "idle",
      caller: null,
      callee: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      iceCandidateQueue: [],
    });
  },

  // Create and send offer (called by caller after callee accepts)
  createOffer: async () => {
    const { callee } = get();
    const socket = getSocket();

    if (!socket || !callee) return;

    set({ callStatus: "connecting" });

    const pc = get().createPeerConnection();

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      console.log("Sending offer to callee:", callee._id);
      socket.emit("call:offer", {
        offer: pc.localDescription,
        calleeId: callee._id,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      toast.error("Failed to establish call.");
      get().endCall();
    }
  },

  // Handle received offer (callee side)
  handleOffer: async (offer, callerId) => {
    const socket = getSocket();
    if (!socket) return;

    console.log("Received offer from caller:", callerId);

    // Update caller ID in case it wasn't set properly
    const { caller } = get();
    if (caller && !caller._id) {
      set({ caller: { ...caller, _id: callerId } });
    }

    // Wait a bit for localStream to be ready if it's not
    let attempts = 0;
    while (!get().localStream && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!get().localStream) {
      console.error("No local stream available for offer handling");
      toast.error("Failed to access camera. Please try again.");
      get().endCall();
      return;
    }

    console.log("Local stream ready, creating peer connection");
    const pc = get().createPeerConnection();

    try {
      console.log("Setting remote description (offer)");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Process any queued ICE candidates
      await get().processIceCandidateQueue();

      console.log("Creating answer");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("Sending answer to caller:", callerId);
      socket.emit("call:answer", {
        answer: pc.localDescription,
        callerId,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
      toast.error("Failed to connect call.");
      get().endCall();
    }
  },

  // Handle received answer (caller side)
  handleAnswer: async (answer) => {
    const { peerConnection } = get();

    console.log("Received answer from callee");

    if (!peerConnection) {
      console.error("No peer connection when receiving answer");
      return;
    }

    try {
      console.log("Setting remote description (answer)");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Remote description set successfully");

      // Process any queued ICE candidates
      await get().processIceCandidateQueue();
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  },

  // Handle received ICE candidate
  handleIceCandidate: async (candidate) => {
    const { peerConnection, iceCandidateQueue } = get();

    if (!peerConnection) {
      console.warn("Received ICE candidate but no peer connection yet, queueing");
      set({ iceCandidateQueue: [...iceCandidateQueue, candidate] });
      return;
    }

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  },

  // Process queued ICE candidates
  processIceCandidateQueue: async () => {
    const { peerConnection, iceCandidateQueue } = get();
    if (!peerConnection || iceCandidateQueue.length === 0) return;

    console.log(`Processing ${iceCandidateQueue.length} queued ICE candidates`);
    for (const candidate of iceCandidateQueue) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding queued ICE candidate:", error);
      }
    }
    set({ iceCandidateQueue: [] });
  },

  // End the call
  endCall: () => {
    const { localStream, remoteStream, peerConnection, caller, callee, callStatus } = get();
    const socket = getSocket();

    // Determine remote user - if we have callee, we're caller; if we have caller, we're callee
    const remoteUserId = callee?._id || caller?._id;

    // Notify remote user
    if (socket && remoteUserId && callStatus !== "idle") {
      socket.emit("call:end", { remoteUserId });
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    // Reset state
    set({
      callStatus: "idle",
      caller: null,
      callee: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      iceCandidateQueue: [],
      isVideoEnabled: true,
      isAudioEnabled: true,
      callStartTime: null,
    });
  },

  // Handle remote call ended
  handleCallEnded: () => {
    const { localStream, remoteStream, peerConnection } = get();

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    toast("Call ended");

    // Reset state
    set({
      callStatus: "idle",
      caller: null,
      callee: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      iceCandidateQueue: [],
      isVideoEnabled: true,
      isAudioEnabled: true,
      callStartTime: null,
    });
  },

  // Toggle video
  toggleVideo: () => {
    const { localStream, isVideoEnabled } = get();

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        set({ isVideoEnabled: !isVideoEnabled });
      }
    }
  },

  // Toggle audio
  toggleAudio: () => {
    const { localStream, isAudioEnabled } = get();

    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        set({ isAudioEnabled: !isAudioEnabled });
      }
    }
  },
}));
