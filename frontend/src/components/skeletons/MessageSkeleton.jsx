const MessageSkeleton = () => {
  // Create 6 skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pine-100/30">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
        >
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <div className="w-10 h-10 rounded-full bg-pine-400 animate-pulse" />
            </div>
          </div>

          <div className="chat-header mb-1">
            <div className="w-16 h-3 bg-pine-400 rounded animate-pulse" />
          </div>

          <div className="chat-bubble bg-pine-400/50">
            <div className="w-48 h-16 bg-pine-400 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
