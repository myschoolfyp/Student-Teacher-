"use client";
import React from 'react';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Profile() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    profilePicture: string;
    userType: string;
    department?: string;
    cnic?: string;
    rollNo?: string;
    classLevel?: string;
    classType?: string;
  } | null>(null);
  
  const [error, setError] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  useEffect(() => {
    const userTypeParam = searchParams.get("userType");
    const identifier = userTypeParam === "Student" 
      ? localStorage.getItem("rollNo")
      : localStorage.getItem("cnic");
    
    if (userTypeParam && identifier) {
      setUserType(userTypeParam);
      fetchUserData(identifier, userTypeParam);
    } else {
      setError("Please login first");
    }
  }, [searchParams]);

  // In the fetchUserData function, modify the data handling:
const fetchUserData = async (identifier: string, userType: string) => {
  try {
    const response = await fetch("/api/profile", {
      headers: { identifier, userType },
    });
    const data = await response.json();
    
    if (data.message) {
      setError(data.message);
    } else {
      setUserData(data);
      // Store student information in localStorage
      // In fetchUserData function of Profile component (page.tsx)
if (userType === "Student") {
  localStorage.setItem("rollNo", data.rollNo);
  localStorage.setItem("classLevel", data.classLevel);
  localStorage.setItem("classType", data.classType);
  localStorage.setItem("className", data.className);
  localStorage.setItem("studentId", data._id); // MongoDB ID
  localStorage.setItem("studentName", `${data.firstName} ${data.lastName}`); // Full name
}
      // Keep existing teacher ID storage
      if (data._id && userType === "Teacher") {
        localStorage.setItem("teacherId", data._id);
      }
    }
  } catch (err) {
    setError("Failed to fetch user details");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("cnic");
    localStorage.removeItem("rollNo");
    router.push("/Components/Login");
  };

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!userData) return <div className="text-center mt-10 text-xl">Loading...</div>;

  return (
    <div className="flex bg-gradient-to-br from-[#0F6466]/90 to-[#0D4B4C]/90 min-h-screen">
      {/* Persistent Sidebar Navigation */}
      <nav className={`fixed inset-y-0 left-0 w-64 bg-white/10 backdrop-blur-md text-white shadow-xl flex flex-col justify-between transition-all duration-300 ${isMenuVisible ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="py-6 text-center font-bold text-2xl border-b border-white/20">
            {userData.userType} Dashboard
          </div>

          {/* Admin Navigation */}
          {userData?.userType === "Admin" && (
            <div className="flex flex-col space-y-5 p-6">
              <div className="space-y-5">
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Admins")}
                >
                  Admins
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Teachers")}
                >
                  Teachers
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Students")}
                >
                  Students
                </button>
              </div>

              <div className="space-y-5 mt-4 border-t-2 border-white/20 pt-4">
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Classes")}
                >
                  Classes
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Courses")}
                >
                  Courses
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Timetable")}
                >
                  Timetable
                </button>
              </div>

              <div className="space-y-5 mt-4 border-t-2 border-white/20 pt-4">
              <button
    className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#e43f73] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
    onClick={() => router.push("/Components/A/Datesheet")} // or "/Components/T/Results" if you want teacher-specific
  >
    Datesheet
  </button>
              <button
    className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
    onClick={() => router.push("/Components/A/Results")}
  >
    Results
  </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/A/Parents")}
                >
                  Parents
                </button>
              </div>
            </div>
          )}

          {/* Teacher Navigation */}
          {userData?.userType === "Teacher" && (
            <div className="flex flex-col space-y-5 p-6">
              <div className="space-y-5">
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/Timetable")}
                >
                  Timetable
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/MyClasses")}
                >
                  My Classes
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/MyClasses/ViewClass/Attendance")}
                >
                  Attendance
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/MyClasses/ViewClass/Assignments")}
                >
                  Assignments
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/MyClasses/ViewClass/Quizzes")}
                >
                  Quizzes
                </button>
              </div>

              <div className="space-y-5 mt-4 border-t-2 border-white/20 pt-4">
              <button
    className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#e43f73] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
    onClick={() => router.push("/Components/A/Results")} // or "/Components/T/Results" if you want teacher-specific
  >
    Datesheet
  </button>
              <button
    className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
    onClick={() => router.push("/Components/A/Results")} // or "/Components/T/Results" if you want teacher-specific
  >
    Results
  </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/Parents")}
                >
                  Parents
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/T/Announcements")}
                >
                  Announcements
                </button>
              </div>
            </div>
          )}

          {/* Student Navigation */}
          {userData?.userType === "Student" && (
            <div className="flex flex-col space-y-5 p-6">
              <div className="space-y-5">
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Timetable")}
                >
                  Timetable
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Courses")}
                >
                  Courses
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Attendance")}
                >
                  Attendance
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Assignments")}
                >
                  Assignments
                </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Quizzes")}
                >
                  Quizzes
                </button>
               
              </div>

              <div className="border-t-2 border-white/20 pt-4">
              <button
    className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#e43f73] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
    onClick={() => router.push("/Components/A/Results")} // or "/Components/T/Results" if you want teacher-specific
  >
    Datesheet
  </button>
                <button
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
                  onClick={() => router.push("/Components/S/Results")}
                >
                  Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-6">
          <button
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#FF6B6B] to-[#FF8787] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-grow p-8 transition-all duration-300 ${isMenuVisible ? "ml-64" : "ml-0"}`}>
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center justify-center w-10 h-10 bg-white text-[#0F6466] rounded-full shadow-lg transition duration-200 hover:bg-gray-100"
            onClick={() => setIsMenuVisible(!isMenuVisible)}
          >
            {isMenuVisible ? "✕" : "☰"}
          </button>
          <button
            className="py-3 px-6 rounded-lg bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] text-white font-medium hover:opacity-90 transition duration-200 shadow-md"
            onClick={() => router.push("/Editprofile")}
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Section */}
        <section className="mb-12 p-8 rounded-xl shadow-lg bg-gradient-to-br from-white to-[#f0fdfa] border-2 border-[#0F6466]/20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F6466] to-[#2D9F9C] rounded-full blur-lg opacity-30 animate-pulse"></div>
              <img
                src={userData.profilePicture || "/default-avatar.png"}
                alt="Profile"
                className="w-48 h-48 rounded-full border-4 border-[#0F6466]/30 shadow-xl relative z-10"
              />
            </div>
            
            <div className="flex flex-col space-y-4 w-full">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[#0F6466] to-[#2D9F9C] bg-clip-text text-transparent">
                {userData.firstName} {userData.lastName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                  <p className="text-lg font-semibold text-[#0F6466]">Contact</p>
                  <p className="text-gray-700">{userData.contactNumber}</p>
                </div>
                
                <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                  <p className="text-lg font-semibold text-[#0F6466]">Email</p>
                  <p className="text-gray-700">{userData.email}</p>
                </div>

                {(userData.userType === "Admin" || userData.userType === "Teacher" || userData.userType === "Parent") && (
                  <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                    <p className="text-lg font-semibold text-[#0F6466]">CNIC</p>
                    <p className="text-gray-700">{userData.cnic}</p>
                  </div>
                )}

                {userData.userType === "Student" && (
                  <>
                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                      <p className="text-lg font-semibold text-[#0F6466]">Roll No</p>
                      <p className="text-gray-700">{userData.rollNo}</p>
                    </div>
                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                      <p className="text-lg font-semibold text-[#0F6466]">Class Level</p>
                      <p className="text-gray-700">Grade {userData.classLevel}</p>
                    </div>
                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
                      <p className="text-lg font-semibold text-[#0F6466]">Class Type</p>
                      <p className="text-gray-700">{userData.classType}</p>
                    </div>
                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10">
      <p className="text-lg font-semibold text-[#0F6466]">Class Name</p>
      <p className="text-gray-700">
        {userData.className || `${userData.classLevel} ${userData.classType}`}
      </p>
    </div>
                   
                    
                    
                  </>
                )}

                {userData.userType === "Teacher" && userData.department && (
                  <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#0F6466]/10 col-span-full">
                    <p className="text-lg font-semibold text-[#0F6466]">Department</p>
                    <p className="text-gray-700">{userData.department}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <h2 className="text-center text-4xl font-bold text-white mt-10 mb-8">
          {userData.userType} Portal
        </h2>
      </main>
    </div>
  );
}