import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageCircle, User, Settings } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-white border-b border-pine-400 fixed w-full top-0 z-40 backdrop-blur-lg bg-white/90">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-pine-900 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-pine-100" />
              </div>
              <h1 className="text-lg font-bold text-pine-900">PingMe</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 flex items-center gap-2 text-pine-900 hover:bg-pine-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center px-4 py-2 bg-pine-900 text-pine-100 hover:bg-pine-700 rounded-lg transition-colors"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
