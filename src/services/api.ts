import axios, { AxiosResponse } from "axios";
import {
  User,
  Module,
  AttendanceSession,
  AttendanceRecord,
  CreateUserRequest,
  CreateModuleRequest,
  CreateSessionRequest,
  ScanQRRequest,
} from "@/src/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Users
export const createUser = (
  userData: CreateUserRequest,
): Promise<AxiosResponse<User>> => api.post("/users", userData);

export const getUsers = (): Promise<AxiosResponse<User[]>> => api.get("/users");

export const getTeachers = (): Promise<AxiosResponse<User[]>> =>
  api.get("/users/teachers");

export const getStudents = (): Promise<AxiosResponse<User[]>> =>
  api.get("/users/students");

export const getUserById = (userId: string): Promise<AxiosResponse<User>> =>
  api.get(`/users/${userId}`);

// Modules
export const createModule = (
  moduleData: CreateModuleRequest,
): Promise<AxiosResponse<Module>> => api.post("/modules", moduleData);

export const getModules = (): Promise<AxiosResponse<Module[]>> =>
  api.get("/modules");

export const getModulesByTeacher = (
  teacherId: string,
): Promise<AxiosResponse<Module[]>> => api.get(`/modules/teacher/${teacherId}`);

// Sessions
export const createSession = (
  sessionData: CreateSessionRequest,
  teacherId: string,
): Promise<AxiosResponse<AttendanceSession>> =>
  api.post(`/sessions?teacherId=${teacherId}`, sessionData);

export const getSession = (
  sessionId: string,
): Promise<AxiosResponse<AttendanceSession>> =>
  api.get(`/sessions/${sessionId}`);

export const startSession = (
  sessionId: string,
): Promise<AxiosResponse<AttendanceSession>> =>
  api.put(`/sessions/${sessionId}/start`);

export const completeSession = (
  sessionId: string,
): Promise<AxiosResponse<AttendanceSession>> =>
  api.put(`/sessions/${sessionId}/complete`);

export const cancelSession = (
  sessionId: string,
): Promise<AxiosResponse<AttendanceSession>> =>
  api.put(`/sessions/${sessionId}/cancel`);

export const getSessionQRImage = (sessionId: string): string =>
  `${API_URL}/sessions/${sessionId}/qr`;

export const getSessionQRData = (
  sessionId: string,
): Promise<AxiosResponse<{ qrToken: string }>> =>
  api.get(`/sessions/${sessionId}/qr-data`);

export const getTodaySessions = (
  teacherId: string,
): Promise<AxiosResponse<AttendanceSession[]>> =>
  api.get(`/sessions/teacher/${teacherId}/today`);

export const getTeacherSessions = (
  teacherId: string,
): Promise<AxiosResponse<AttendanceSession[]>> =>
  api.get(`/sessions/teacher/${teacherId}`);

// Attendance
export const scanQR = (
  scanData: ScanQRRequest,
): Promise<AxiosResponse<AttendanceRecord>> =>
  api.post("/attendance/scan", scanData);

export const getSessionAttendance = (
  sessionId: string,
): Promise<AxiosResponse<AttendanceRecord[]>> =>
  api.get(`/attendance/session/${sessionId}`);

export const getStudentAttendance = (
  studentId: string,
): Promise<AxiosResponse<AttendanceRecord[]>> =>
  api.get(`/attendance/student/${studentId}`);

export const getStudentAttendanceInModule = (
  studentId: string,
  moduleId: string,
): Promise<AxiosResponse<AttendanceRecord[]>> =>
  api.get(`/attendance/student/${studentId}/module/${moduleId}`);

export const getAttendancePercentage = (
  studentId: string,
): Promise<AxiosResponse<{ percentage: number }>> =>
  api.get(`/attendance/student/${studentId}/percentage`);

export const exportAttendanceExcel = (sessionId: string): string =>
  `${API_URL}/attendance/session/${sessionId}/export`;

export default api;
