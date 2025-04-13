// src/app/Components/T/MyClasses/ViewClass/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewClass() {
  const router = useRouter();
  const [className, setClassName] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);

  useEffect(() => {
    // Access search parameters in client-side effect
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get("className");
    const courseValue = searchParams.get("course");
    const roomValue = searchParams.get("room");

    // Set state with class information
    setClassName(name);
    setCourse(courseValue);
    setRoom(roomValue);
  }, []); // Run once on mount

  // To handle a case where the parameters might not be set
  if (!className || !course || !room) {
    return <div className="text-center mt-8">Invalid class details!</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F6466] mb-6">Class Details</h1>
      
      <div className="bg-gradient-to-r from-[#0F6466] to-[#1C9B9D] p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-white">Class: {className}</h2>
        <p className="text-white">Course: {course}</p>
        <p className="text-white">Room: {room}</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className="w-full py-3 rounded-lg bg-[#0F6466] text-white hover:bg-[#1C9B9D] transition duration-200"
          onClick={() => router.push(`/Components/T/MyClasses/ViewClass/Attendance?className=${encodeURIComponent(className)}`)}
        >
          Attendance
        </button>
        <button
          className="w-full py-3 rounded-lg bg-[#0F6466] text-white hover:bg-[#1C9B9D] transition duration-200"
          onClick={() => router.push(`/Components/T/MyClasses/ViewClass/Assignments/Create?className=${encodeURIComponent(className)}`)}
        >
          Assignments
        </button>
        <button
          className="w-full py-3 rounded-lg bg-[#0F6466] text-white hover:bg-[#1C9B9D] transition duration-200"
          onClick={() => router.push(`/Components/T/MyClasses/ViewClass/Quizzes?className=${encodeURIComponent(className)}`)}
        >
          Quizzes
        </button>
        <button
          className="w-full py-3 rounded-lg bg-[#0F6466] text-white hover:bg-[#1C9B9D] transition duration-200"
          onClick={() => router.push(`/Components/T/MyClasses/ViewClass/Grades?className=${encodeURIComponent(className)}`)}
        >
          Grades
        </button>
      </div>
    </div>
  );
}