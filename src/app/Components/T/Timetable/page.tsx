// src/app/Components/T/Timetable/page.tsx
"use client";
import { useState, useEffect } from "react";

interface Slot {
  startTime: string;
  endTime: string;
  course: string;
  room: string;
  className: string;
  day: string;
}

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      try {
        const response = await fetch(`/api/Component/T/timetable?teacherId=${teacherId}`);
        const data = await response.json();
        setTimetable(data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading timetable...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F6466] mb-6">Your Teaching Schedule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <div key={day} className="bg-gradient-to-r from-[#0F6466] to-[#1C9B9D] p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">{day}</h3>
            {timetable
              .filter((slot) => slot.day === day)
              .map((slot, index) => (
                <div key={index} className="bg-white p-4 rounded-md shadow-md mb-3">
                  <div className="text-sm text-[#0F6466] font-medium">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className="my-2 font-bold text-[#0F6466]">{slot.course}</div>
                  <div className="flex justify-between text-sm">
                    <span>Class: {slot.className}</span>
                    <span>Room: {slot.room}</span>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}