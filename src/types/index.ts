export enum UserRole {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum SessionStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  LATE = "LATE",
  ABSENT = "ABSENT",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  microsoftId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  moduleCode: string;
  moduleName: string;
  description?: string;
  teacher: User;
  active: boolean;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  module: Module;
  teacher: User;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classroom: string;
  qrValidityMinutes: number;
  status: SessionStatus;
  createdAt: string;
  locationRequired: boolean;
  campusLatitude?: number;
  campusLongitude?: number;
  campusRadiusMeters?: number;
  mandatoryAttendance: boolean;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  student: User;
  markedAt: string;
  status: AttendanceStatus;
  deviceInfo?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  microsoftId?: string;
}

export interface CreateModuleRequest {
  moduleCode: string;
  moduleName: string;
  description?: string;
  teacherId: string;
}

export interface CreateSessionRequest {
  moduleId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classroom: string;
  qrValidityMinutes?: number;
  locationRequired?: boolean;
  campusLatitude?: number;
  campusLongitude?: number;
  campusRadiusMeters?: number;
  mandatoryAttendance?: boolean;
}

export interface ScanQRRequest {
  qrToken: string;
  studentId: string;
  deviceInfo?: string;
  latitude?: number;
  longitude?: number;
}
