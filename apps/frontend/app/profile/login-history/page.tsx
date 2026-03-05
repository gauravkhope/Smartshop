"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { fetchLoginHistory } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Loader2,
  ArrowLeft,
  Chrome,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface LoginRecord {
  id: number;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string | null;
  loginAt: string;
  logoutAt: string | null;
  sessionDuration: number | null;
}

export default function LoginHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadHistory();
  }, [isAuthenticated, router]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLoginHistory();
      setHistory(data.history);
    } catch (error: any) {
      toast.error(error.message || "Failed to load login history");
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-blue-500" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-purple-500" />;
      default:
        return <Monitor className="w-5 h-5 text-green-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBrowserColor = (browser: string) => {
    switch (browser?.toLowerCase()) {
      case "chrome":
        return "text-yellow-600 bg-yellow-50";
      case "firefox":
        return "text-orange-600 bg-orange-50";
      case "safari":
        return "text-blue-600 bg-blue-50";
      case "edge":
        return "text-indigo-600 bg-indigo-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Loading login history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Login History
                </h1>
                <p className="text-sm text-gray-600">
                  Review your recent account activity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Security Notice
              </h3>
              <p className="text-sm text-blue-800">
                If you notice any suspicious activity, change your password
                immediately and contact support.
              </p>
            </div>
          </div>
        </div>

        {/* Login History List */}
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Login History
              </h3>
              <p className="text-gray-600">
                Your login history will appear here
              </p>
            </div>
          ) : (
            history.map((record, index) => (
              <div
                key={record.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Device Icon */}
                    <div className="mt-1">{getDeviceIcon(record.device)}</div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {record.device || "Unknown Device"}
                        </h3>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {/* Browser */}
                        <div className="flex items-center gap-2">
                          <Chrome className="w-4 h-4" />
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getBrowserColor(
                              record.browser
                            )}`}
                          >
                            {record.browser || "Unknown Browser"}
                          </span>
                        </div>

                        {/* IP Address */}
                        {record.ipAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>IP: {record.ipAddress}</span>
                          </div>
                        )}

                        {/* Location */}
                        {record.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{record.location}</span>
                          </div>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(record.loginAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status */}
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Successful
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Card */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {history.length}
                </p>
                <p className="text-sm text-gray-600">Total Logins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-500">
                  {
                    new Set(history.map((h) => h.device?.toLowerCase())).size
                  }
                </p>
                <p className="text-sm text-gray-600">Devices Used</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {
                    new Set(history.map((h) => h.browser?.toLowerCase())).size
                  }
                </p>
                <p className="text-sm text-gray-600">Browsers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
