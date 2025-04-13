// app/Components/A/Datesheet/Create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClassData {
  _id: string;
  className: string;
  classLevel: string;
  courses: string[];
}

export default function CreateDatesheet() {
  const router = useRouter();
  const [datesheetName, setDatesheetName] = useState("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [examSchedule, setExamSchedule] = useState<{ 
    course: string; 
    date: string;
    time: string;
  }[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradients = {
    primary: "bg-gradient-to-r from-[#0F6466] to-[#2D9F9C]",
    secondary: "bg-gradient-to-r from-[#4C6EF5] to-[#748FFC]",
    purple: "bg-gradient-to-r from-[#7950F2] to-[#9775FA]",
  };

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/Datesheet/Create?action=fetchClasses");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  // Update exam schedule when class changes
  useEffect(() => {
    if (selectedClass) {
      setExamSchedule(selectedClass.courses.map(course => ({
        course,
        date: "",
        time: ""
      })));
    }
  }, [selectedClass]);

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const updatedSchedule = [...examSchedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setExamSchedule(updatedSchedule);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    if (!datesheetName || !selectedClass) {
      setError("Datesheet name and class selection are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/Component/A/Datesheet/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datesheetName,
          className: selectedClass.className,
          classId: selectedClass._id,
          classLevel: selectedClass.classLevel,
          schedule: examSchedule
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create datesheet");
      }

      router.push("/Components/A/Datesheet/View");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create datesheet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className={`${gradients.primary} p-6 rounded-2xl shadow-lg mb-8`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Create Datesheet</h1>
          <p className="text-white/90 mt-2">Schedule exams and create academic calendars</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="space-y-6">
            {/* Datesheet Name */}
            <div>
              <label className="block mb-2 text-[#0F6466] font-medium">Datesheet Name*</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C]"
                value={datesheetName}
                onChange={(e) => setDatesheetName(e.target.value)}
                placeholder="e.g., Spring 2025 Final Exams"
                required
              />
            </div>

            {/* Class Selection */}
            <div>
              <label className="block mb-2 text-[#0F6466] font-medium">Select Class*</label>
              <select
                className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C]"
                onChange={(e) => {
                  const cls = classes.find(c => c._id === e.target.value);
                  setSelectedClass(cls || null);
                }}
                required
              >
                <option value="">Select a Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.classLevel} - {cls.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Schedule */}
            {selectedClass && (
              <div className="space-y-6">
                <div className={`${gradients.secondary} p-6 rounded-xl text-white`}>
                  <h3 className="text-xl font-semibold mb-2">Exam Schedule</h3>
                  <p className="opacity-90">Class: {selectedClass.classLevel} - {selectedClass.className}</p>
                </div>

                <div className="space-y-4">
                  {examSchedule.map((exam, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-[#0F6466]">{exam.course}</span>
                      <input
                        type="date"
                        className="p-2 border rounded-md"
                        value={exam.date}
                        onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                        required
                      />
                      <input
                        type="time"
                        className="p-2 border rounded-md"
                        value={exam.time}
                        onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`${gradients.primary} text-white px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md text-lg font-semibold w-full`}
                >
                  {isSubmitting ? "Creating Datesheet..." : "Publish Datesheet"}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      </div>
    </div>
  );
}