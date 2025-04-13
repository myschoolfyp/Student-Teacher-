"use client";

import { useEffect, useState } from "react";

// Gradient colors for course tiles
const courseGradients = [
  "from-[#0F6466] to-[#2D9F9C]",    // Teal
  "from-[#4C6EF5] to-[#748FFC]",    // Blue
  "from-[#7950F2] to-[#9775FA]",    // Purple
  "from-[#F76707] to-[#FF922B]",    // Orange
  "from-[#E64980] to-[#F783AC]",    // Pink
  "from-[#2F9E44] to-[#69DB7C]",    // Green
  "from-[#D6336C] to-[#F06595]",    // Rose
  "from-[#1864AB] to-[#4DABF7]"     // Dark Blue
];

export default function Courses() {
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get class info from localStorage
  const classLevel = localStorage.getItem("classLevel");
  const classType = localStorage.getItem("classType");
  const className = localStorage.getItem("className") || `Grade ${classLevel} ${classType}`;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!classLevel || !classType) {
          throw new Error("Class information not found in storage");
        }

        const response = await fetch(
          `/api/Component/S/Courses?className=${encodeURIComponent(className)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses);
      } catch (err: any) {
        setError(err.message || "Error loading courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [className, classLevel, classType]);

  if (loading) return (
    <div className="text-center p-8 text-xl text-[#0F6466]">
      Loading courses...
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-[#0F6466] mb-4 md:mb-0">
            {className} Curriculum
          </h1>
          <div className="bg-white px-6 py-2 rounded-full shadow-md flex items-center">
            <span className="text-[#0F6466] font-medium mr-2">Total Courses:</span>
            <span className="text-2xl font-bold text-[#2D9F9C]">{courses.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 min-h-[200px] flex items-center justify-center
                transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                bg-gradient-to-br ${courseGradients[index % courseGradients.length]}
                shadow-md backdrop-blur-sm border border-white/20`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-2">
                  {course.split('-')[0].trim()}
                </p>
                <p className="text-white/90 font-medium">
                  Course Code: {course.split('-')[1].trim()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}