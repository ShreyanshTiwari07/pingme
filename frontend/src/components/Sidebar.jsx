import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import Avatar from "./Avatar";
import { Users, LogOut } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, onlineUsers } = useChatStore();
  const { logout, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  console.log("Sidebar - onlineUsers:", onlineUsers);
  console.log("Sidebar - users:", users.map(u => ({ id: u._id, type: typeof u._id })));

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => {
        const isOnline = onlineUsers.includes(String(user._id));
        console.log(`Checking user ${user.fullName} (${user._id}): ${isOnline}`);
        return isOnline;
      })
    : users;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-24 sm:w-64 lg:w-80 border-r border-pine-400 flex flex-col transition-all duration-200 bg-pine-100">
      {/* Header */}
      <div className="border-b border-pine-400 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-pine-900" />
          <span className="font-medium hidden sm:block text-pine-900">Contacts</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-3 hidden sm:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-xs text-pine-700">Show online only</span>
          </label>
          <span className="text-xs text-pine-700">({users.length} total)</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3 flex-1">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-pine-400 transition-colors
              ${selectedUser?._id === user._id ? "bg-pine-400 ring-1 ring-pine-700" : ""}
            `}
          >
            <div className="relative mx-auto sm:mx-0">
              <Avatar
                src={user.profilePic}
                alt={user.fullName}
                size="md"
              />
              {/* Online indicator */}
              {onlineUsers.includes(String(user._id)) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* User info - visible on sm screens and larger */}
            <div className="hidden sm:block text-left min-w-0 flex-1">
              <div className="font-medium truncate text-pine-900">{user.fullName}</div>
              <div className="text-sm text-pine-700 truncate">
                {onlineUsers.includes(String(user._id)) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-pine-700 py-4">No online users found</div>
        )}
      </div>

      {/* Profile Section */}
      <div className="border-t border-pine-400 p-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar
              src={authUser?.profilePic}
              alt={authUser?.fullName}
              size="sm"
            />
            {/* Current user is always online */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden sm:block flex-1 min-w-0">
            <p className="text-sm font-medium text-pine-900 truncate">{authUser?.fullName}</p>
            <p className="text-xs text-green-600 truncate">Online</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-pine-400 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-pine-900" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
