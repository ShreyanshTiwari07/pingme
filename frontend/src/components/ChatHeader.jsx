import { X, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useVideoCallStore } from "../store/useVideoCallStore";
import Avatar from "./Avatar";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, onlineUsers } = useChatStore();
  const { authUser } = useAuthStore();
  const { initiateCall, callStatus } = useVideoCallStore();

  const isOnline = onlineUsers.includes(String(selectedUser._id));
  const canCall = isOnline && callStatus === "idle";

  return (
    <div className="p-4 border-b border-pine-400 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative border-2 border-pine-400 rounded-full">
            <Avatar
              src={selectedUser.profilePic}
              alt={selectedUser.fullName}
              size="sm"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-xl text-pine-900">{selectedUser.fullName}</h3>
            <p className={`text-base ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Video call button */}
          <button
            onClick={() => initiateCall(selectedUser)}
            disabled={!canCall}
            className={`p-2 rounded-full transition-colors ${
              canCall
                ? "hover:bg-pine-100 text-pine-700 hover:text-pine-900"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title={canCall ? "Start video call" : isOnline ? "Already in a call" : "User is offline"}
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-pine-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-pine-900" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
