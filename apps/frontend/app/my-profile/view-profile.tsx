"use client";
import React, { useState } from "react";

export default function ViewProfilePage() {
  // Notification preferences state
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState("");

  // Delete account state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveNotif = () => {
    // TODO: Add backend API call to save preferences
    setNotifSuccess("Notification preferences updated!");
  };

  const handleDelete = async () => {
    setLoading(true);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      // TODO: Replace with backend API call to delete account
      await new Promise(res => setTimeout(res, 1500));
      setDeleteSuccess("Your account has been deleted. We're sorry to see you go!");
      setConfirmOpen(false);
    } catch (e) {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
          {/* Profile picture placeholder */}
          <span className="text-6xl text-gray-400">👤</span>
        </div>
        <div className="text-lg font-semibold text-gray-700 mb-2">User Name</div>
        <div className="text-gray-500 mb-2">user@email.com</div>
        <div className="text-gray-500 mb-2">+91 98765 43210</div>
        <button className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">Edit Profile</button>
        {/* Notification Preferences */}
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
              <span className="font-semibold">Email Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} />
              <span className="font-semibold">SMS Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} />
              <span className="font-semibold">Push Notifications</span>
            </label>
            {notifSuccess && <div className="text-green-600 font-semibold">{notifSuccess}</div>}
            <button
              type="button"
              onClick={handleSaveNotif}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Save Preferences
            </button>
          </div>
        </div>
        {/* Delete Account Option */}
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
          <p className="text-red-600 font-semibold mb-2">Warning: This action is irreversible.</p>
          <button
            type="button"
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            onClick={() => setConfirmOpen(true)}
          >
            Delete My Account
          </button>
          {confirmOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col gap-4">
                <h2 className="text-xl font-bold text-red-600">Confirm Account Deletion</h2>
                <p>Are you sure you want to delete your account? This cannot be undone.</p>
                {deleteError && <div className="text-red-500 font-semibold">{deleteError}</div>}
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded font-semibold"
                    onClick={() => setConfirmOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {deleteSuccess && <div className="text-green-600 font-semibold mt-4">{deleteSuccess}</div>}
        </div>
      </div>
    </div>
  );
}
