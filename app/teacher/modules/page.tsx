"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTeachers, getModulesByTeacher, createModule } from "@/src/services/api";
import { User, Module, CreateModuleRequest } from "@/src/types";

export default function ModuleManagement() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateModuleRequest>({
    moduleCode: "",
    moduleName: "",
    description: "",
    teacherId: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      loadModules();
      setFormData((prev) => ({ ...prev, teacherId: selectedTeacher.id }));
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
    }
  };

  const loadModules = async () => {
    if (!selectedTeacher) return;
    try {
      const response = await getModulesByTeacher(selectedTeacher.id);
      setModules(response.data);
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.moduleCode || !formData.moduleName) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createModule(formData);
      alert("Module created successfully!");
      setShowCreateForm(false);
      loadModules();

      // Reset form
      setFormData({
        moduleCode: "",
        moduleName: "",
        description: "",
        teacherId: selectedTeacher?.id || "",
      });
    } catch (error: any) {
      alert(
        "Error creating module: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            📚 Module Management
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
        {/* Teacher Selection */}
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
            {/* Create Module Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {showCreateForm ? "❌ Cancel" : "➕ Create New Module"}
              </button>
            </div>

            {/* Create Module Form */}
            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Create New Module
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Module Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Code *
                      </label>
                      <input
                        type="text"
                        name="moduleCode"
                        value={formData.moduleCode}
                        onChange={handleInputChange}
                        placeholder="CS101"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        E.g., CS101, MATH201
                      </p>
                    </div>

                    {/* Module Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Name *
                      </label>
                      <input
                        type="text"
                        name="moduleName"
                        value={formData.moduleName}
                        onChange={handleInputChange}
                        placeholder="Introduction to Programming"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the module..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Teacher Info (Read-only) */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Assigned Teacher:
                    </p>
                    <p className="text-gray-800">
                      {selectedTeacher.firstName} {selectedTeacher.lastName} (
                      {selectedTeacher.email})
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {loading ? "Creating..." : "✅ Create Module"}
                  </button>
                </form>
              </div>
            )}

            {/* Modules List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Modules ({modules.length})
              </h2>

              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No modules yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Create your first module above
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {module.moduleCode}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            module.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {module.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        {module.moduleName}
                      </p>
                      {module.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {module.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        <p>
                          Created:{" "}
                          {new Date(module.createdAt).toLocaleDateString()}
                        </p>
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
