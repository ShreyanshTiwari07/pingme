import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageContextMenu from "./MessageContextMenu";
import Avatar from "./Avatar";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close context menu when clicking elsewhere or scrolling
  useEffect(() => {
    const handleScroll = () => setContextMenu(null);
    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    // Don't show context menu for deleted messages
    if (message.deletedForEveryone) return;

    setContextMenu({
      messageId: message._id,
      isOwnMessage: message.senderId === authUser._id,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-pine-100/30">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            onContextMenu={(e) => handleContextMenu(e, message)}
          >
            <div className="chat-message-wrapper">
              <div className="chat-image">
                <div className="border-2 border-pine-400 rounded-full">
                  <Avatar
                    src={message.senderId === authUser._id ? authUser.profilePic : selectedUser.profilePic}
                    alt={message.senderId === authUser._id ? authUser.fullName : selectedUser.fullName}
                    size="sm"
                  />
                </div>
              </div>
              <div className="chat-content">
                {message.deletedForEveryone ? (
                  <div
                    className={`chat-bubble italic ${
                      message.senderId === authUser._id
                        ? "bg-pine-600/50 text-pine-200"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <p className="flex items-center gap-1">
                      <span className="text-sm">This message was deleted</span>
                    </p>
                  </div>
                ) : (
                  <div
                    className={`chat-bubble ${
                      message.senderId === authUser._id
                        ? "bg-pine-700 text-white"
                        : "bg-white text-pine-900"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[250px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p className="break-words">{message.text}</p>}
                  </div>
                )}
                <div className="chat-header">
                  {formatMessageTime(message.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          messageId={contextMenu.messageId}
          isOwnMessage={contextMenu.isOwnMessage}
          position={contextMenu.position}
          onClose={closeContextMenu}
        />
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
