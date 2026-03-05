"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { updateUserProfile } from "@/lib/api";
import toast from "react-hot-toast";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


export default function ViewProfilePage() {
  // Auth context for global user state
  const { user, updateUser } = useAuth();

  // Provide fallback values if user is null
  const safeUser = {
    name: user?.name || "Guest",
    email: user?.email || "guest@example.com",
    avatar: user?.avatar || "/images/avatars/avatar1.png",
  };

  const [localUser, setLocalUser] = useState({
    name: safeUser.name,
    email: safeUser.email,
    avatar: safeUser.avatar,
  });

  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(safeUser.avatar);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null); // file to upload
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [form, setForm] = useState({
    name: safeUser.name,
    email: safeUser.email,
    newPassword: "",
    confirmNewPassword: "",
    avatar: safeUser.avatar,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState("");
  const [passwordUpdateError, setPasswordUpdateError] = useState("");

  // 12 cartoon avatar images
  const avatarList = Array.from({ length: 12 }, (_, i) => `/images/avatars/avatar${i + 1}.png`);

  const handleDelete = async () => {
    setLoading(true);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setDeleteSuccess("Your account has been deleted. We're sorry to see you go!");
      setConfirmOpen(false);
    } catch (e) {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = () => setShowUpdate(true);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setLocalUser((prev) => ({ ...prev, avatar }));
    setForm((prev) => ({ ...prev, avatar }));
    if (user) {
      updateUser({ ...user, avatar }); // update context quickly
    }
    setCustomAvatarFile(null); // using preset avatar, no file upload
    setShowAvatarModal(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    // Basic client-side size/type checks (optional)
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Please upload an image smaller than ${maxMB}MB`);
      return;
    }
    setCustomAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedAvatar(previewUrl);
    setForm((prev) => ({ ...prev, avatar: previewUrl }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordUpdateSuccess("");
    setPasswordUpdateError("");

    // First: send profile update (name, email, avatar)
    try {
      // updateUserProfile accepts either File or string for avatar
      const payloadAvatar = customAvatarFile ? customAvatarFile : form.avatar;

      const res = await updateUserProfile({
        name: form.name,
        email: form.email,
        avatar: payloadAvatar,
      });

      // res expected shape: { message, user }
     if (res?.user) {
  // ✅ Construct correct backend URL for avatar
  const backendAvatarUrl = res.user.avatar?.startsWith("/uploads")
    ? `${API_URL}${res.user.avatar}`
    : res.user.avatar;

  setLocalUser({
    name: res.user.name,
    email: res.user.email,
    avatar: backendAvatarUrl || selectedAvatar,
  });

  updateUser({
    ...res.user,
    avatar: backendAvatarUrl || selectedAvatar,
  });

  toast.success("Profile updated successfully!");
}
 else {
        toast.success("Profile updated (response missing user object).");
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error?.message || "Failed to update profile.");
    }

    // Then: password update if required (unchanged original flow)
    if (form.newPassword && form.confirmNewPassword && passwordVerified) {
      if (form.newPassword !== form.confirmNewPassword) {
        setPasswordUpdateError("New passwords do not match.");
        return;
      }
      try {
        const userId = user?.email || "guest@example.com";
        const resp = await fetch("/api/update-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, currentPassword, newPassword: form.newPassword }),
        });
        const data = await resp.json();
        if (data.success) {
          setPasswordUpdateSuccess("Password updated successfully.");
          setShowUpdate(false);
          setShowPasswordSection(false);
          setPasswordVerified(false);
          setCurrentPassword("");
          setForm((prev) => ({ ...prev, newPassword: "", confirmNewPassword: "" }));
        } else {
          setPasswordUpdateError(data.error || "Failed to update password.");
        }
      } catch (err) {
        setPasswordUpdateError("Server error. Please try again.");
      }
    } else {
      // close edit mode if only profile change
      setShowUpdate(false);
      setShowPasswordSection(false);
      setPasswordVerified(false);
      setCurrentPassword("");
      setForm((prev) => ({ ...prev, newPassword: "", confirmNewPassword: "" }));
    }
  };

  const handleVerifyPassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const entered = currentPassword.trim();
    setPasswordError("");
    try {
      const userId = user?.email || "guest@example.com";
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password: entered }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordVerified(true);
        setPasswordError("");
      } else {
        setPasswordVerified(false);
        setPasswordError(data.error || "You have entered wrong Password");
      }
    } catch (err) {
      setPasswordVerified(false);
      setPasswordError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-100 py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8">
        {/* Current Details */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-tr from-orange-400 to-indigo-400 flex items-center justify-center shadow-lg mb-2 overflow-hidden ${
              showUpdate ? "cursor-pointer" : ""
            }`}
            onClick={() => showUpdate && setShowAvatarModal(true)}
          >
            <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>

          {showUpdate && <div className="text-xs text-gray-500 mb-2">Click avatar to change or upload</div>}

          <div className="text-2xl font-bold text-gray-800">{user?.name ? user.name.toUpperCase() : "GUEST"}</div>
          <div className="text-md text-gray-500">User ID: {user?.email || "guest@example.com"}</div>
        </div>

        {/* Avatar Selection Modal (only in update mode) */}
        {showAvatarModal && showUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-lg p-8 max-w-lg w-full flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Choose Your Avatar</h2>

              <div className="mb-2">
                <label className="text-sm block mb-1 text-gray-600">Or upload your own</label>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {avatarList.map((avatar, idx) => (
                  <div
                    key={avatar}
                    className={`rounded-full border-4 cursor-pointer transition-all ${
                      selectedAvatar === avatar ? "border-orange-500 scale-110" : "border-transparent"
                    }`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-20 h-20 object-cover rounded-full" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setCustomAvatarFile(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-indigo-500 text-white rounded-lg"
                  onClick={() => {
                    // If uploaded file exists, keep its preview; we already set selectedAvatar from the upload
                    setShowAvatarModal(false);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Details & Change Password Buttons */}
        {!showUpdate && (
          <div className="flex gap-4">
            <button
              className="mt-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-indigo-600 transition shadow"
              onClick={handleUpdateClick}
            >
              Update Details
            </button>
          </div>
        )}

        {/* Update Form: Personal, Password, Address */}
        {showUpdate && (
          <form className="w-full flex flex-col gap-6" onSubmit={handleUpdateSubmit}>
            {/* Personal Details */}
            <div className="bg-gradient-to-r from-orange-100 to-indigo-100 rounded-xl p-6 shadow flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Personal Details</h2>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleFormChange}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleFormChange}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Email"
              />
            </div>

            {/* Password Section */}
            <div className="bg-gradient-to-r from-indigo-100 to-orange-100 rounded-xl p-6 shadow flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Change Password</h2>
              {!showPasswordSection && (
                <button
                  type="button"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-orange-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-orange-600 transition shadow"
                  onClick={() => setShowPasswordSection(true)}
                >
                  Change Password
                </button>
              )}

              {showPasswordSection && !passwordVerified && (
                <div className="flex flex-col gap-4">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Current Password"
                  />
                  {passwordError && <div className="text-red-600 font-semibold text-sm">{passwordError}</div>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-orange-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-orange-600 transition shadow"
                      onClick={handleVerifyPassword}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-200 rounded-xl"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setCurrentPassword("");
                        setPasswordError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showPasswordSection && passwordVerified && (
                <>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleFormChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="New Password"
                  />
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={form.confirmNewPassword}
                    onChange={handleFormChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Confirm New Password"
                  />
                  <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-orange-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-orange-600 transition shadow"
                  >
                    Change Password
                  </button>
                  {passwordUpdateError && <div className="text-red-600 font-semibold text-sm">{passwordUpdateError}</div>}
                  {passwordUpdateSuccess && <div className="text-green-600 font-semibold text-sm">{passwordUpdateSuccess}</div>}
                </>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-indigo-600 transition shadow"
            >
              Save Changes
            </button>
          </form>
        )}

        {/* Delete Account Option */}
        <div className="w-full bg-gradient-to-r from-red-100 to-orange-100 rounded-xl p-6 shadow flex flex-col gap-3 mt-2">
          <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
          <p className="text-red-600 font-semibold mb-2">Warning: This action is irreversible.</p>
          <button
            type="button"
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition shadow"
            onClick={() => setConfirmOpen(true)}
          >
            Delete My Account
          </button>

          {confirmOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full flex flex-col gap-4">
                <h2 className="text-xl font-bold text-red-600">Confirm Account Deletion</h2>
                <p>Are you sure you want to delete your account? This cannot be undone.</p>
                {deleteError && <div className="text-red-500 font-semibold">{deleteError}</div>}
                <div className="flex gap-4 mt-4">
                  <button type="button" className="px-4 py-2 bg-gray-300 rounded font-semibold" onClick={() => setConfirmOpen(false)} disabled={loading}>
                    Cancel
                  </button>
                  <button type="button" className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded font-semibold hover:from-red-600 hover:to-orange-600 transition" onClick={handleDelete} disabled={loading}>
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteSuccess && <div className="text-green-600 font-semibold mt-2">{deleteSuccess}</div>}
        </div>
      </div>
    </div>
  );
}
