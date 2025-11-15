import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "./store/useAuthStore";
import { useListenOnlineUsers } from "./hooks/useListenOnlineUsers";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useListenOnlineUsers();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pine-900 via-pine-700 to-pine-400">
        <Loader className="w-10 h-10 animate-spin text-pine-100" />
      </div>
    );

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3E5F44',
            color: '#E8FFD7',
          },
          success: {
            iconTheme: {
              primary: '#93DA97',
              secondary: '#E8FFD7',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff6b6b',
              secondary: '#E8FFD7',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
