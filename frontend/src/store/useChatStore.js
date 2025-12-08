import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { socket } from "../lib/socket";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  onlineUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/auth/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/auth/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/auth/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessageForMe: async (messageId) => {
    try {
      await axiosInstance.delete(`/auth/delete-for-me/${messageId}`);
      // Remove message from local state
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  deleteMessageForEveryone: async (messageId) => {
    try {
      await axiosInstance.delete(`/auth/delete-for-everyone/${messageId}`);
      // Update message in local state to show as deleted
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: null, image: null, deletedForEveryone: true }
            : msg
        ),
      });
      toast.success("Message deleted for everyone");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for message deletions
    socket.on("messageDeleted", ({ messageId, deletedForEveryone }) => {
      if (deletedForEveryone) {
        set({
          messages: get().messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, text: null, image: null, deletedForEveryone: true }
              : msg
          ),
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    socket.off("newMessage");
    socket.off("messageDeleted");
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },
}));
