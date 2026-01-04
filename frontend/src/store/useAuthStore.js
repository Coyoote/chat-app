import { create } from "zustand";
import { api } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const useAuthStore = create((set, get) => ({
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLogginOut: false,
  isUpdatingProfile: false,
  user: null,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/check");
      set({ user: res.data.data });
      get().connectSocket();
    } catch (error) {
      console.log(`Error in checkAuth: ${error}`);
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post("/auth/signup", data);
      set({ user: res.data.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ user: res.data.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    set({ isLogginOut: true });
    try {
      await api.post("/auth/logout");
      set({ user: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLogginOut: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await api.put("/auth/update-profile", data);
      set({ user: res.data.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { user } = get();
    if (!user || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: user._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
