import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageCircle, User, Settings } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-gradient-to-r from-pine-900 via-pine-700 to-pine-900 border-b-2 border-pine-400 shadow-lg fixed w-full top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-pine-100 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                <MessageCircle className="w-6 h-6 text-pine-900" />
              </div>
              <h1 className="text-xl font-bold text-pine-100 group-hover:text-white transition-colors">
                PingMe
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 flex items-center gap-2 text-pine-100 hover:bg-pine-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                <button
                  className="flex gap-2 items-center px-4 py-2 bg-pine-100 text-pine-900 hover:bg-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
