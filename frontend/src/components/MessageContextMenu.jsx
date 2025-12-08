import { useEffect, useRef } from "react";
import { Trash2, UserX, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const MessageContextMenu = ({ messageId, isOwnMessage, position, onClose }) => {
  const menuRef = useRef(null);
  const { deleteMessageForMe, deleteMessageForEveryone } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleDeleteForMe = async () => {
    await deleteMessageForMe(messageId);
    onClose();
  };

  const handleDeleteForEveryone = async () => {
    await deleteMessageForEveryone(messageId);
    onClose();
  };

  // Calculate position to ensure menu stays within viewport
  const menuStyle = {
    position: "fixed",
    top: position.y,
    left: position.x,
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={handleDeleteForMe}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
      >
        <UserX className="w-4 h-4 text-gray-500" />
        Delete for me
      </button>

      {isOwnMessage && (
        <button
          onClick={handleDeleteForEveryone}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
        >
          <Users className="w-4 h-4" />
          Delete for everyone
        </button>
      )}
    </div>
  );
};

export default MessageContextMenu;
