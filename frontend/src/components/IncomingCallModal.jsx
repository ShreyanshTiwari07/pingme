import { Phone, PhoneOff } from "lucide-react";
import { useVideoCallStore } from "../store/useVideoCallStore";

const IncomingCallModal = () => {
  const { callStatus, caller, acceptCall, rejectCall } = useVideoCallStore();

  if (callStatus !== "incoming" || !caller) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {/* Caller info */}
        <div className="text-center mb-6">
          {/* Avatar with ringing animation */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-pine-100 flex items-center justify-center overflow-hidden ring-4 ring-pine-400 animate-pulse">
              {caller.profilePic ? (
                <img
                  src={caller.profilePic}
                  alt={caller.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-pine-600 font-semibold">
                  {caller.fullName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            {/* Ringing indicator */}
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="w-3 h-3 text-white" />
            </span>
          </div>

          <h3 className="text-xl font-bold text-pine-900 mb-1">
            {caller.fullName || "Unknown"}
          </h3>
          <p className="text-pine-600 animate-pulse">Incoming video call...</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg">
              <PhoneOff className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm text-gray-600">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-lg animate-bounce">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm text-gray-600">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
