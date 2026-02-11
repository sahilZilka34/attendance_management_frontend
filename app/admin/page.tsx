"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, createModule } from "@/src/services/api";
import { UserRole, CreateUserRequest, CreateModuleRequest } from "@/src/types";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "modules">("users");
  const [loading, setLoading] = useState(false);

  // User Form
  const [userForm, setUserForm] = useState<CreateUserRequest>({
    email: "",
    firstName: "",
    lastName: "",
    role: UserRole.STUDENT,
  });

  // Module Form
  const [moduleForm, setModuleForm] = useState({
    moduleCode: "",
    moduleName: "",
    description: "",
    teacherId: "",
  });

 const handleUserSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);
   try {
     await createUser(userForm);
     toast.success(`${userForm.role} created successfully!`, {
       duration: 3000,
     });

     // Reset form
     setUserForm({
       email: "",
       firstName: "",
       lastName: "",
       role: UserRole.STUDENT,
     });
   } catch (error: any) {
     toast.error(error.response?.data?.message || "Failed to create user");
   } finally {
     setLoading(false);
   }
 };
  const handleBulkCreate = () => {
    const count = prompt("How many students do you want to create?", "10");
    if (!count) return;

    const num = parseInt(count);
    if (isNaN(num) || num < 1 || num > 100) {
      toast.error("Please enter a number between 1 and 100");
      return;
    }

    const students = [];
    for (let i = 1; i <= num; i++) {
      students.push({
        email: `student${i}@university.edu`,
        firstName: `Student`,
        lastName: `${i}`,
        role: UserRole.STUDENT,
      });
    }

    createBulkUsers(students);
  };

 const createBulkUsers = async (users: CreateUserRequest[]) => {
   setLoading(true);
   let successCount = 0;
   let errorCount = 0;

   const loadingToast = toast.loading(`Creating ${users.length} users...`);

   for (const user of users) {
     try {
       await createUser(user);
       successCount++;
     } catch (error) {
       errorCount++;
       console.error(`Failed to create ${user.email}:`, error);
     }
   }

   toast.dismiss(loadingToast);

   if (errorCount === 0) {
     toast.success(`✅ Created ${successCount} users successfully!`);
   } else {
     toast.error(`Created ${successCount} users, ${errorCount} failed`);
   }

   setLoading(false);
 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔧 Admin Panel</h1>
          <button
            onClick={() => router.push("/")}
            className="text-white hover:text-gray-200"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Warning Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Admin Access - Use Responsibly
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                This panel allows creating users and modules. In production,
                this should be protected with admin authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              👥 Create Users
            </button>
            <button
              onClick={() => setActiveTab("modules")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "modules"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              📚 Quick Info
            </button>
          </div>
        </div>

        {/* Create User Form */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Create New User
            </h2>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={UserRole.TEACHER}
                      checked={userForm.role === UserRole.TEACHER}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-2 text-gray-700">👨‍🏫 Teacher</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={UserRole.STUDENT}
                      checked={userForm.role === UserRole.STUDENT}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-2 text-gray-700">🎓 Student</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  placeholder="john.doe@university.edu"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, firstName: e.target.value })
                    }
                    placeholder="John"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, lastName: e.target.value })
                    }
                    placeholder="Doe"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 font-medium"
              >
                {loading
                  ? "Creating..."
                  : `✅ Create ${userForm.role === UserRole.TEACHER ? "Teacher" : "Student"}`}
              </button>
            </form>

            {/* Bulk Create */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                ⚡ Bulk Create Students
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Quickly create multiple students for testing. They will be named
                Student 1, Student 2, etc.
              </p>
              <button
                onClick={handleBulkCreate}
                disabled={loading}
                className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 font-medium"
              >
                ⚡ Bulk Create Students
              </button>
            </div>

            {/* Quick Create Presets */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🚀 Quick Presets
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await createUser({
                        email: "prof.johnson@university.edu",
                        firstName: "Robert",
                        lastName: "Johnson",
                        role: UserRole.TEACHER,
                      });
                      alert("✅ Professor Johnson created!");
                    } catch (error: any) {
                      alert("Error: " + error.response?.data?.message);
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:bg-gray-400"
                >
                  👨‍🏫 Create Demo Teacher
                </button>
                <button
                  onClick={() =>
                    createBulkUsers(
                      Array.from({ length: 5 }, (_, i) => ({
                        email: `demo.student${i + 1}@university.edu`,
                        firstName: "Demo",
                        lastName: `Student ${i + 1}`,
                        role: UserRole.STUDENT,
                      })),
                    )
                  }
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:bg-gray-400"
                >
                  🎓 Create 5 Demo Students
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Info Tab */}
        {activeTab === "modules" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📚 System Setup Guide
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">
                  📝 Demo Setup Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Create a teacher using the form</li>
                  <li>Create 5-10 students (use bulk create)</li>
                  <li>Go to Teacher Dashboard → Manage Modules</li>
                  <li>Create a module (e.g., CS101)</li>
                  <li>Create a session for today</li>
                  <li>Start the session to generate QR code</li>
                  <li>Students can scan to mark attendance</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">
                  ✅ Testing Checklist:
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✓ Create teacher and students</li>
                  <li>✓ Create module</li>
                  <li>✓ Create and start session</li>
                  <li>✓ View QR code</li>
                  <li>✓ Test scanning from mobile</li>
                  <li>✓ Check attendance list updates</li>
                  <li>✓ Export Excel report</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold text-yellow-900 mb-2">
                  📱 Mobile Testing:
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  To test on mobile, make sure backend is accessible from your
                  network:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li>Deploy backend to Heroku/Railway</li>
                  <li>Update frontend API URL</li>
                  <li>Deploy frontend to Vercel</li>
                  <li>Open on mobile browser</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
