import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getSocket } from "../lib/socket";

export const useListenOnlineUsers = () => {
  const { setOnlineUsers } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();
    console.log("useListenOnlineUsers - Socket instance:", socket);
    console.log("useListenOnlineUsers - authUser:", authUser?._id);

    if (!socket) {
      console.log("useListenOnlineUsers - No socket available");
      return;
    }

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Received getOnlineUsers event with userIds:", userIds);
      console.log("UserIds type:", typeof userIds, "isArray:", Array.isArray(userIds));
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [setOnlineUsers, authUser]);
};
