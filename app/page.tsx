"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📱 Attendance Management System
          </h1>
          <p className="text-xl text-gray-600">
            QR Code-based attendance with location verification
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Teacher Card */}
          <div
            onClick={() => router.push("/teacher")}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher</h2>
              <p className="text-gray-600 mb-6">
                Create sessions, generate QR codes, and track attendance
              </p>
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                Teacher Dashboard
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => router.push("/admin")}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2 md:col-span-2"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Admin Panel
              </h2>
              <p className="text-white mb-6">
                Create teachers, students, and manage the system
              </p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Admin Access
              </button>
            </div>
          </div>
          {/* Student Card */}
          <div
            onClick={() => router.push("/student")}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Student</h2>
              <p className="text-gray-600 mb-6">
                Scan QR codes to mark attendance and view your records
              </p>
              <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
                Student Portal
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ✨ Features
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">🔒 Secure QR Codes</span>
                <p className="text-gray-600">AES encryption with expiry</p>
              </div>
              <div>
                <span className="font-semibold">📍 Location Verification</span>
                <p className="text-gray-600">GPS-based campus check</p>
              </div>
              <div>
                <span className="font-semibold">📊 Excel Reports</span>
                <p className="text-gray-600">Download attendance data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
