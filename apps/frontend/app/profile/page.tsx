"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { fetchUserProfile, updateUserProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User, Mail, Loader2, Save, Calendar, Camera } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatar?: string; // ✅ new field
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState({ name: "", email: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [isAuthenticated, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile();
      setProfile(data.user);
      setFormData({ name: data.user.name, email: data.user.email, avatar: null });
      setPreview(data.user.avatar || null);
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile");
      if (error.message.includes("Unauthorized")) router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const data = await updateUserProfile({
        name: formData.name,
        email: formData.email !== profile?.email ? formData.email : undefined,
        avatar: formData.avatar || profile?.avatar,
      });

      setProfile(data.user);
      updateUser(data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({ name: profile.name, email: profile.email, avatar: null });
      setPreview(profile.avatar || null);
    }
    setErrors({ name: "", email: "" });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img
                src={preview || "/images/default-avatar.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <>
                  <label className="absolute bottom-0 right-0 bg-black/60 p-1 rounded-full cursor-pointer hover:bg-black/80 transition">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
            <div className="mt-4 text-center text-white">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-white/90 capitalize">{profile.role}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                    isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-gray-200"
                  } ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                    isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-gray-200"
                  } ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formatDate(profile.createdAt)}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
