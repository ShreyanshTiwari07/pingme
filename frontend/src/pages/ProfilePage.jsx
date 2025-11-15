import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pine-900 via-pine-700 to-pine-400 pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-8">
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-pine-900 hover:text-pine-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Chat
            </button>
            <h1 className="text-2xl font-semibold text-pine-900">Profile</h1>
            <p className="mt-2 text-pine-700">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {selectedImg ? (
                <img
                  src={selectedImg}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-pine-400"
                />
              ) : (
                <div className="border-4 border-pine-400 rounded-full">
                  <Avatar
                    src={authUser.profilePic}
                    alt={authUser.fullName}
                    size="lg"
                  />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-pine-900 hover:bg-pine-700
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-pine-700">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Profile info */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-pine-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-pine-100 rounded-lg border border-pine-400 text-pine-900">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-pine-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-pine-100 rounded-lg border border-pine-400 text-pine-900">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Account info */}
          <div className="mt-6 bg-pine-100 rounded-xl p-6">
            <h2 className="text-lg font-medium text-pine-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-pine-400">
                <span className="text-pine-700">Member Since</span>
                <span className="text-pine-900">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-pine-700">Account Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
