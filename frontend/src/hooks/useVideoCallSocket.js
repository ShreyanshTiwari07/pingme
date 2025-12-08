import { useEffect } from "react";
import { getSocket } from "../lib/socket";
import { useVideoCallStore } from "../store/useVideoCallStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const useVideoCallSocket = () => {
  const { authUser } = useAuthStore();
  const {
    handleIncomingCall,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleCallEnded,
    callStatus,
  } = useVideoCallStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !authUser) return;

    // Incoming call from another user
    const onIncomingCall = ({ caller }) => {
      // Add current user info to caller object
      handleIncomingCall(caller);
    };

    // Call was accepted by callee
    const onCallAccepted = ({ calleeId }) => {
      // Now create and send the WebRTC offer
      createOffer();
    };

    // Call was rejected by callee
    const onCallRejected = ({ calleeId }) => {
      toast("Call was declined");
      useVideoCallStore.getState().endCall();
    };

    // Received WebRTC offer from caller
    const onOffer = ({ offer, callerId }) => {
      handleOffer(offer, callerId);
    };

    // Received WebRTC answer from callee
    const onAnswer = ({ answer, calleeId }) => {
      handleAnswer(answer);
    };

    // Received ICE candidate
    const onIceCandidate = ({ candidate, userId }) => {
      handleIceCandidate(candidate);
    };

    // Call ended by remote user
    const onCallEnded = ({ userId, reason }) => {
      if (reason === "disconnected") {
        toast("User disconnected");
      }
      handleCallEnded();
    };

    // User is busy (already in a call)
    const onCallBusy = ({ calleeId }) => {
      toast("User is busy on another call");
      useVideoCallStore.getState().endCall();
    };

    // Error handling
    const onCallError = ({ message }) => {
      toast.error(message);
      useVideoCallStore.getState().endCall();
    };

    // Register all event listeners
    socket.on("call:incoming", onIncomingCall);
    socket.on("call:accepted", onCallAccepted);
    socket.on("call:rejected", onCallRejected);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:ended", onCallEnded);
    socket.on("call:busy", onCallBusy);
    socket.on("call:error", onCallError);

    // Cleanup on unmount
    return () => {
      socket.off("call:incoming", onIncomingCall);
      socket.off("call:accepted", onCallAccepted);
      socket.off("call:rejected", onCallRejected);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:ended", onCallEnded);
      socket.off("call:busy", onCallBusy);
      socket.off("call:error", onCallError);
    };
  }, [authUser]);
};
