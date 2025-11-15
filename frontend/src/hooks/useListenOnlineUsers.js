import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getSocket } from "../lib/socket";

export const useListenOnlineUsers = () => {
  const { setOnlineUsers } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [setOnlineUsers, authUser]);
};
