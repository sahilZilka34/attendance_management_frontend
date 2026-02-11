"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getStudents, scanQR, getStudentAttendance } from "@/src/services/api";
import { User, AttendanceRecord } from "@/src/types";
import toast from "react-hot-toast";

export default function StudentPortal() {
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadAttendanceHistory();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
      if (response.data.length > 0) {
        setSelectedStudent(response.data[0]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    }
  };

  const loadAttendanceHistory = async () => {
    if (!selectedStudent) return;
    try {
      const response = await getStudentAttendance(selectedStudent.id);
      setAttendanceHistory(response.data);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Failed to load attendance history");
    }
  };

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);

    if (navigator.geolocation) {
      const locationToast = toast.loading("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss(locationToast);
          initializeScanner(
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          toast.dismiss(locationToast);
          toast.error(
            "Location permission denied. Some sessions require location verification.",
          );
          initializeScanner(null, null);
        },
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      initializeScanner(null, null);
    }
  };

  const initializeScanner = (
    latitude: number | null,
    longitude: number | null,
  ) => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanning(false);
        await handleScan(decodedText, latitude, longitude);
      },
      (error) => {
        // Scanning error - ignore
      },
    );
  };

  const handleScan = async (
    qrToken: string,
    latitude: number | null,
    longitude: number | null,
  ) => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Marking attendance...");

    try {
      const scanData = {
        qrToken,
        studentId: selectedStudent.id,
        deviceInfo: navigator.userAgent,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };

      const response = await scanQR(scanData);

      toast.dismiss(loadingToast);
      setScanResult("success");
      toast.success(
        `Attendance marked successfully!\nStatus: ${response.data.status}`,
        { duration: 5000 },
      );

      loadAttendanceHistory();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      setScanResult("error");
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    const qrToken = prompt("Enter QR Code Token:");
    if (!qrToken) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleScan(
            qrToken,
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        () => {
          handleScan(qrToken, null, null);
        },
      );
    } else {
      handleScan(qrToken, null, null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            🎓 Student Portal
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent?.id || ""}
            onChange={(e) => {
              const student = students.find((s) => s.id === e.target.value);
              setSelectedStudent(student || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} - {student.email}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📱 Scan QR Code
              </h2>

              {!scanning && !loading && (
                <div className="space-y-3">
                  <button
                    onClick={startScanner}
                    className="w-full bg-purple-500 text-white px-6 py-4 rounded-lg hover:bg-purple-600 transition-colors font-medium text-lg"
                  >
                    📸 Open Camera to Scan
                  </button>
                  <button
                    onClick={handleManualEntry}
                    className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ⌨️ Enter Code Manually (For Testing)
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    💡 Position the QR code within the camera frame
                  </p>
                </div>
              )}

              {scanning && (
                <div>
                  <div id="qr-reader" className="w-full"></div>
                  <button
                    onClick={() => {
                      setScanning(false);
                      const element = document.getElementById("qr-reader");
                      if (element) element.innerHTML = "";
                    }}
                    className="w-full mt-4 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ❌ Cancel Scanning
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Marking attendance...</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📊 Your Attendance History ({attendanceHistory.length})
              </h2>

              {attendanceHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No attendance records yet
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Scan a QR code to mark attendance
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceHistory.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            Session ID: {record.sessionId.slice(0, 8)}...
                          </p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>
                              📅{" "}
                              {new Date(record.markedAt).toLocaleDateString()}
                            </p>
                            <p>
                              ⏰{" "}
                              {new Date(record.markedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
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
          </>
        )}
      </div>
    </div>
  );
}
