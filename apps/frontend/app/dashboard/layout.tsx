"use client";
import React from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-orange-600">User Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="font-semibold text-gray-700 hover:text-orange-500">Overview</Link>
          <Link href="/dashboard/profile" className="font-semibold text-gray-700 hover:text-orange-500">Profile</Link>
          <Link href="/dashboard/settings" className="font-semibold text-gray-700 hover:text-orange-500">Settings</Link>
          <Link href="/dashboard/notifications" className="font-semibold text-gray-700 hover:text-orange-500">Notifications</Link>
          <Link href="/dashboard/delete" className="font-semibold text-red-600 hover:text-red-800">Delete Account</Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
