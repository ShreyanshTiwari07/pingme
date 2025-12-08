import { PhoneOff } from "lucide-react";
import { useVideoCallStore } from "../store/useVideoCallStore";

const CallingOverlay = () => {
  const { callStatus, callee, endCall } = useVideoCallStore();

  if (callStatus !== "calling" || !callee) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-pine-900/95 z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Callee avatar with pulsing ring */}
        <div className="relative inline-block mb-6">
          {/* Animated rings */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-pine-400/20 animate-ping" />
          <div
            className="absolute inset-0 w-32 h-32 rounded-full bg-pine-400/30 animate-ping"
            style={{ animationDelay: "0.5s" }}
          />

          {/* Avatar */}
          <div className="relative w-32 h-32 rounded-full bg-pine-700 flex items-center justify-center overflow-hidden border-4 border-pine-400">
            {callee.profilePic ? (
              <img
                src={callee.profilePic}
                alt={callee.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl text-pine-300 font-semibold">
                {callee.fullName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Callee name */}
        <h3 className="text-2xl font-bold text-white mb-2">
          {callee.fullName || "Unknown"}
        </h3>

        {/* Calling status */}
        <p className="text-pine-300 mb-8 flex items-center justify-center gap-1">
          <span>Calling</span>
          <span className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
              .
            </span>
          </span>
        </p>

        {/* Cancel button */}
        <button
          onClick={endCall}
          className="flex flex-col items-center gap-2 mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </div>
          <span className="text-sm text-pine-300">Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default CallingOverlay;
