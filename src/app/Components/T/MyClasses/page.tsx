// src/app/Components/T/MyClasses/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClassSlot {
  className: string;
  course: string;
  room: string;
}

export default function MyClasses() {
  const [classes, setClasses] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      try {
        const response = await fetch(`/api/Component/T/timetable?teacherId=${teacherId}`);
        const timetableData = await response.json();

        // Extract class details
        const assignedClasses: ClassSlot[] = timetableData.map((slot: any) => ({
          className: slot.className,
          course: slot.course,
          room: slot.room,
        }));
        
        setClasses(assignedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading classes...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F6466] mb-6">My Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classSlot, index) => (
          <div key={index} className="bg-gradient-to-r from-[#0F6466] to-[#1C9B9D] p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <h3 className="text-xl font-semibold text-white mb-2">{classSlot.className}</h3>
            <div className="text-white font-medium mb-4">
              <p>Course: {classSlot.course}</p>
              <p>Room: {classSlot.room}</p>
            </div>
            <button
              className="w-full py-2 rounded-lg bg-white text-[#0F6466] hover:bg-gray-200 transition duration-200"
              onClick={() => {
                // Ensure query params are properly encoded
                const encodedClassName = encodeURIComponent(classSlot.className);
                const encodedCourse = encodeURIComponent(classSlot.course);
                const encodedRoom = encodeURIComponent(classSlot.room);
                router.push(`/Components/T/MyClasses/ViewClass?className=${encodedClassName}&course=${encodedCourse}&room=${encodedRoom}`);
              }}
            >
              View Class
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}