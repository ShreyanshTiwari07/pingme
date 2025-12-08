import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useVideoCallStore } from "../store/useVideoCallStore";

const VideoCall = () => {
  const {
    callStatus,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    endCall,
    callStartTime,
    caller,
    callee,
  } = useVideoCallStore();

  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState("00:00");

  // Callback ref for local video - attaches stream immediately when element mounts
  const localVideoRef = useCallback(
    (node) => {
      if (node && localStream) {
        node.srcObject = localStream;
        node.play().catch((e) => {
          console.log("Local video autoplay prevented:", e);
        });
      }
    },
    [localStream]
  );

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // Force play in case autoplay is blocked
      remoteVideoRef.current.play().catch((e) => {
        console.log("Remote video autoplay prevented:", e);
      });
    }
  }, [remoteStream]);

  // Update call duration
  useEffect(() => {
    if (callStatus !== "connected" || !callStartTime) {
      setCallDuration("00:00");
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");
      setCallDuration(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus, callStartTime]);

  // Don't render if not in an active call
  if (callStatus !== "connecting" && callStatus !== "connected") {
    return null;
  }

  // Determine the remote user based on who we are in the call
  // If callee is set, we initiated the call, so the remote user is the callee
  // If caller is set (and callee is not), we received the call, so remote user is the caller
  const remoteUser = callee ? callee : caller;

  return (
    <div className="fixed inset-0 bg-pine-900 z-50 flex flex-col">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative bg-pine-800">
        {/* Always render video element for ref attachment */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${!remoteStream ? "hidden" : ""}`}
        />
        {/* Show placeholder when no remote stream */}
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-pine-700 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {remoteUser?.profilePic ? (
                  <img
                    src={remoteUser.profilePic}
                    alt={remoteUser?.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-pine-300">
                    {remoteUser?.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <p className="text-pine-300 text-lg">
                {callStatus === "connecting" ? "Connecting..." : "Waiting for video..."}
              </p>
            </div>
          </div>
        )}

        {/* Local video (small overlay) */}
        <div className="absolute bottom-24 right-4 w-32 h-44 sm:w-40 sm:h-56 rounded-lg overflow-hidden bg-pine-700 shadow-lg border-2 border-pine-500">
          {localStream && isVideoEnabled ? (
            <video
              key={localStream?.id || "local-video"}
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-pine-800">
              <VideoOff className="w-8 h-8 text-pine-400" />
            </div>
          )}
        </div>

        {/* Call info overlay */}
        <div className="absolute top-4 left-4 right-4 text-white bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm max-w-fit">
          <p className="font-semibold text-lg truncate max-w-[200px]">{remoteUser?.fullName || "Unknown"}</p>
          <p className="text-pine-300 text-sm">
            {callStatus === "connected" ? callDuration : "Connecting..."}
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-pine-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Toggle microphone */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled
                ? "bg-pine-600 hover:bg-pine-500 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          {/* Toggle video */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled
                ? "bg-pine-600 hover:bg-pine-500 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
