"use client";

import { useEffect, useState } from "react";

const courseGradients = [
  "from-[#0F6466] to-[#2D9F9C]",
  "from-[#4C6EF5] to-[#748FFC]",
  "from-[#7950F2] to-[#9775FA]",
  "from-[#F76707] to-[#FF922B]",
  "from-[#E64980] to-[#F783AC]",
  "from-[#2F9E44] to-[#69DB7C]",
  "from-[#D6336C] to-[#F06595]",
  "from-[#1864AB] to-[#4DABF7]"
];

export default function Attendance() {
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get student and class info from localStorage
  const classLevel = localStorage.getItem("classLevel");
  const classType = localStorage.getItem("classType");
  const className = localStorage.getItem("className") || `Grade ${classLevel} ${classType}`;
  const rollNo = localStorage.getItem("rollNo");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!classLevel || !classType || !rollNo) {
          throw new Error("Student information not found in storage");
        }

        const response = await fetch(
          `/api/Component/S/Courses?className=${encodeURIComponent(className)}`
        );

        if (!response.ok) throw new Error("Failed to fetch courses");
        
        const data = await response.json();
        setCourses(data.courses);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [className, classLevel, classType, rollNo]);

  const handleCourseSelect = async (course: string) => {
    setSelectedCourse(course);
    try {
      const response = await fetch(
        `/api/Component/S/Attendance?className=${encodeURIComponent(className)}&course=${encodeURIComponent(course)}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch attendance records");
      
      const data = await response.json();
      
      // Filter records for current student
      const studentRecords = data.map((record: any) => ({
        ...record,
        studentStatus: record.students.find((s: any) => s.rollNo === rollNo)?.status || "A"
      }));

      setAttendanceRecords(studentRecords);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="text-center p-8 text-xl text-[#0F6466]">
      Loading attendance data...
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-8">
      {error}
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F6466] mb-4 md:mb-0">
            {className} Attendance
          </h1>
          {selectedCourse && (
            <div className="bg-white px-5 py-2 rounded-full shadow-sm flex items-center">
              <span className="text-[#0F6466] font-medium mr-2">Total Classes:</span>
              <span className="text-xl font-bold text-[#2D9F9C]">{attendanceRecords.length}</span>
            </div>
          )}
        </div>

        {!selectedCourse ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {courses.map((course, index) => (
              <button
                key={index}
                onClick={() => handleCourseSelect(course)}
                className={`rounded-xl p-4 min-h-[120px] flex items-center justify-center
                  transform transition-all duration-200 hover:scale-105 hover:shadow-lg
                  bg-gradient-to-br ${courseGradients[index % courseGradients.length]}
                  shadow-sm backdrop-blur-sm border border-white/20 cursor-pointer`}
              >
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-1">
                    {course.split('-')[0].trim()}
                  </p>
                  <p className="text-white/90 text-sm">
                    {course.split('-')[1].trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setSelectedCourse(null)}
              className="mb-6 px-4 py-2 bg-[#0F6466] text-white rounded-lg hover:bg-[#2D9F9C] transition-colors"
            >
              ← Back to Courses
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#0F6466] text-white">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">End Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-b even:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">{record.startTime}</td>
                      <td className="px-4 py-3 text-center">{record.endTime}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          record.studentStatus === 'P' ? 'bg-green-100 text-green-800' :
                          record.studentStatus === 'A' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.studentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceRecords.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  No attendance records found for this course
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}