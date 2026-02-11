"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getSession,
  getSessionAttendance,
  completeSession,
  getSessionQRImage,
  exportAttendanceExcel,
} from "@/src/services/api";
import { AttendanceSession, AttendanceRecord } from "@/src/types";
import toast from "react-hot-toast";

export default function SessionQRPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [qrExpired, setQrExpired] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);
  // Check QR expiry
  useEffect(() => {
    if (!session || session.status !== "ACTIVE") return;

    const checkExpiry = () => {
      const sessionStart = new Date(
        `${session.sessionDate}T${session.startTime}`,
      );
      const expiryTime = new Date(
        sessionStart.getTime() + session.qrValidityMinutes * 60000,
      );
      const now = new Date();
      const remaining = Math.floor(
        (expiryTime.getTime() - now.getTime()) / 1000,
      );

      if (remaining <= 0) {
        setQrExpired(true);
        setTimeRemaining(0);
        toast.error("QR Code has expired!", { id: "qr-expired" });
      } else {
        setQrExpired(false);
        setTimeRemaining(remaining);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);

    return () => clearInterval(interval);
  }, [session]);
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAttendance();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const [sessionRes, attendanceRes] = await Promise.all([
        getSession(sessionId),
        getSessionAttendance(sessionId),
      ]);
      setSession(sessionRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      console.error("Error loading session:", error);
      alert("Error loading session");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await getSessionAttendance(sessionId);
      setAttendance(response.data);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

 const handleCompleteSession = async () => {
   try {
     await completeSession(sessionId);
     toast.success("Session completed successfully!");
     setTimeout(() => router.push("/teacher"), 1500);
   } catch (error: any) {
     toast.error(error.response?.data?.message || "Failed to complete session");
   }
 };

  const handleExport = () => {
    window.open(exportAttendanceExcel(sessionId), "_blank");
  };
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-800">Session not found</p>
          <button
            onClick={() => router.push("/teacher")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            📱 QR Code Session
          </h1>
          <button
            onClick={() => router.push("/teacher")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {session.module.moduleName}
              </h2>
              <p className="text-gray-600 mb-1">{session.module.moduleCode}</p>
              <p className="text-sm text-gray-500 mb-6">
                {session.classroom} • {session.startTime} - {session.endTime}
              </p>

              {/* Status Badge */}
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                  session.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : session.status === "COMPLETED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {session.status}
              </span>

              {/* QR Code */}
              {/* QR Code */}
              {session.status === "ACTIVE" && (
                <div className="mb-6">
                  {!qrExpired ? (
                    <>
                      <img
                        src={getSessionQRImage(sessionId)}
                        alt="QR Code"
                        className="mx-auto border-4 border-gray-200 rounded-lg shadow-md"
                        style={{ width: "400px", height: "400px" }}
                      />
                      <div className="mt-4 text-center">
                        <div
                          className={`inline-block px-4 py-2 rounded-lg ${
                            timeRemaining && timeRemaining < 60
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <p className="text-sm font-medium">
                            ⏱️ Expires in:{" "}
                            {timeRemaining
                              ? formatTimeRemaining(timeRemaining)
                              : "Calculating..."}
                          </p>
                        </div>
                      </div>
                      {session.locationRequired && (
                        <p className="text-sm text-blue-600 mt-2 text-center">
                          📍 Location verification enabled
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                      <div className="text-6xl mb-4">⏰</div>
                      <p className="text-xl font-bold text-red-800 mb-2">
                        QR Code Expired
                      </p>
                      <p className="text-gray-600">
                        The QR code is no longer valid for scanning
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Valid for {session.qrValidityMinutes} minutes from
                        session start
                      </p>
                    </div>
                  )}
                </div>
              )}

              {session.status === "COMPLETED" && (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">✅ Session Completed</p>
                  <p className="text-gray-500 mt-2">
                    QR code is no longer active
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {session.status === "ACTIVE" && (
                  <button
                    onClick={handleCompleteSession}
                    className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    ✓ Complete Session
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  📊 Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance List */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Attendance ({attendance.length})
              </h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
              </label>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No attendance yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Students will appear here as they scan
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {attendance.map((record, index) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-700">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {record.student.firstName}{" "}
                              {record.student.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {record.student.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <p>
                            ⏰ {new Date(record.markedAt).toLocaleTimeString()}
                          </p>
                          {record.deviceInfo && (
                            <p className="truncate">📱 {record.deviceInfo}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "PRESENT"
                            ? "bg-green-100 text-green-800"
                            : record.status === "LATE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
