"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTeachers,
  getModulesByTeacher,
  createSession,
  getTodaySessions,
  startSession,
} from "@/src/services/api";
import {
  User,
  Module,
  AttendanceSession,
  CreateSessionRequest,
} from "@/src/types";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [todaySessions, setTodaySessions] = useState<AttendanceSession[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateSessionRequest>({
    moduleId: "",
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    classroom: "",
    qrValidityMinutes: 15,
    locationRequired: false,
    campusLatitude: 48.8534,
    campusLongitude: 2.3483,
    campusRadiusMeters: 500,
    mandatoryAttendance: true,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      loadModules();
      loadTodaySessions();
    }
  }, [selectedTeacher]);

  const loadTeachers = async () => {
    try {
      const response = await getTeachers();
      setTeachers(response.data);
      if (response.data.length > 0) {
        setSelectedTeacher(response.data[0]);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const loadModules = async () => {
    if (!selectedTeacher) return;
    try {
      const response = await getModulesByTeacher(selectedTeacher.id);
      setModules(response.data);
    } catch (error) {
      console.error("Error loading modules:", error);
      toast.error("Failed to load modules");
    }
  };

  const loadTodaySessions = async () => {
    if (!selectedTeacher) return;
    try {
      const response = await getTodaySessions(selectedTeacher.id);
      setTodaySessions(response.data);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId);
      toast.success("Session started successfully!");
      router.push(`/teacher/session/${sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start session");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.moduleId) {
      toast.error("Please select a module");
      return;
    }

    if (!selectedTeacher) {
      toast.error("No teacher selected");
      return;
    }

    setLoading(true);
    try {
      await createSession(formData, selectedTeacher.id);
      toast.success("Session created successfully!");
      setShowCreateSession(false);
      loadTodaySessions();

      setFormData({
        moduleId: "",
        sessionDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:30",
        classroom: "",
        qrValidityMinutes: 15,
        locationRequired: false,
        campusLatitude: 48.8534,
        campusLongitude: 2.3483,
        campusRadiusMeters: 500,
        mandatoryAttendance: true,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            👨‍🏫 Teacher Dashboard
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teacher
          </label>
          <select
            value={selectedTeacher?.id || ""}
            onChange={(e) => {
              const teacher = teachers.find((t) => t.id === e.target.value);
              setSelectedTeacher(teacher || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} - {teacher.email}
              </option>
            ))}
          </select>
        </div>

        {selectedTeacher && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <button
                onClick={() => setShowCreateSession(!showCreateSession)}
                className="bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {showCreateSession ? "❌ Cancel" : "➕ Create New Session"}
              </button>
              <button
                onClick={() => router.push("/teacher/modules")}
                className="bg-purple-500 text-white px-6 py-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                📚 Manage Modules
              </button>
            </div>

            {showCreateSession && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Create New Session
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module *
                    </label>
                    <select
                      name="moduleId"
                      value={formData.moduleId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select a module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.moduleCode} - {module.moduleName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="sessionDate"
                        value={formData.sessionDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Classroom *
                      </label>
                      <input
                        type="text"
                        name="classroom"
                        value={formData.classroom}
                        onChange={handleInputChange}
                        placeholder="Room 101"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Validity (minutes)
                      </label>
                      <input
                        type="number"
                        name="qrValidityMinutes"
                        value={formData.qrValidityMinutes}
                        onChange={handleInputChange}
                        min="5"
                        max="60"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="locationRequired"
                        checked={formData.locationRequired}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">
                        📍 Require Campus Location
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="mandatoryAttendance"
                        checked={formData.mandatoryAttendance}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">
                        ⚠️ Mandatory Attendance
                      </span>
                    </label>
                    {formData.mandatoryAttendance && (
                      <p className="text-sm text-orange-600 mt-2">
                        📋 Absences will be flagged in reports
                      </p>
                    )}
                  </div>

                  {formData.locationRequired && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        📍 Campus Location Settings
                      </h3>

                      <div className="mb-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              const loadingToast = toast.loading(
                                "Getting your location...",
                              );
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    campusLatitude: position.coords.latitude,
                                    campusLongitude: position.coords.longitude,
                                  }));
                                  toast.dismiss(loadingToast);
                                  toast.success(
                                    "Location captured successfully!",
                                  );
                                },
                                (error) => {
                                  toast.dismiss(loadingToast);
                                  toast.error(
                                    "Could not get location. Please enable location services.",
                                  );
                                },
                              );
                            } else {
                              toast.error(
                                "Geolocation is not supported by your browser",
                              );
                            }
                          }}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          📍 Use My Current Location
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                campusLatitude: 53.4187916,
                                campusLongitude: -7.9036762,
                                campusRadiusMeters: 500,
                              }));
                              toast.success("Set to Athlone Campus");
                            }}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            🏫 Athlone Campus
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                campusLatitude: 52.6748926,
                                campusLongitude: -8.6485083,
                                campusRadiusMeters: 500,
                              }));
                              toast.success("Set to Moylish Campus");
                            }}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            🏫 Moylish Campus
                          </button>
                        </div>
                      </div>

                      <details className="mb-3">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                          ⚙️ Manual Entry (Advanced)
                        </summary>
                        <div className="grid md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Latitude
                            </label>
                            <input
                              type="number"
                              name="campusLatitude"
                              value={formData.campusLatitude}
                              onChange={handleInputChange}
                              step="0.0001"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Longitude
                            </label>
                            <input
                              type="number"
                              name="campusLongitude"
                              value={formData.campusLongitude}
                              onChange={handleInputChange}
                              step="0.0001"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Radius (meters)
                            </label>
                            <input
                              type="number"
                              name="campusRadiusMeters"
                              value={formData.campusRadiusMeters}
                              onChange={handleInputChange}
                              min="50"
                              max="5000"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </details>

                      <div className="bg-white p-3 rounded border border-blue-200 text-sm">
                        <p className="font-medium text-gray-700 mb-1">
                          Current Settings:
                        </p>
                        <p className="text-gray-600">
                          📍 Lat: {formData.campusLatitude?.toFixed(4)}, Lng:{" "}
                          {formData.campusLongitude?.toFixed(4)}
                        </p>
                        <p className="text-gray-600">
                          📏 Radius: {formData.campusRadiusMeters}m
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">
                        💡 Tip: Use &quot;Use My Current Location&quot; if
                        you&apos;re already on campus, or select a preset
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {loading ? "Creating..." : "✅ Create Session"}
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📅 Today&apos;s Sessions
              </h2>

              {todaySessions.length === 0 ? (
                <p className="text-gray-600">No sessions scheduled for today</p>
              ) : (
                <div className="space-y-4">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {session.module.moduleName}
                          </h3>
                          <p className="text-gray-600">
                            {session.module.moduleCode}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            🕐 {session.startTime} - {session.endTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            📍 {session.classroom}
                          </p>
                          {session.locationRequired && (
                            <p className="text-sm text-blue-600 mt-1">
                              📍 Location verification enabled
                            </p>
                          )}
                          <span
                            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                              session.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : session.status === "COMPLETED"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="space-x-2">
                          {session.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleStartSession(session.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              ▶️ Start Session
                            </button>
                          )}
                          {session.status === "ACTIVE" && (
                            <button
                              onClick={() =>
                                router.push(`/teacher/session/${session.id}`)
                              }
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              📱 View QR Code
                            </button>
                          )}
                        </div>
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
