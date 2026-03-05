"use client";
import React from "react";

export default function DashboardOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-4xl mb-2">👤</span>
          <p className="font-semibold text-gray-700">Profile</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-4xl mb-2">⚙️</span>
          <p className="font-semibold text-gray-700">Settings</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-4xl mb-2">🔔</span>
          <p className="font-semibold text-gray-700">Notifications</p>
        </div>
      </div>
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-orange-700 mb-2">Welcome to your dashboard!</h2>
        <p className="text-gray-700">Manage your profile, account settings, and notification preferences all in one place.</p>
      </div>
    </div>
  );
}
