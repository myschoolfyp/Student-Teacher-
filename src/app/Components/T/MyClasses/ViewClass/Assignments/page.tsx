"use client";
import Link from "next/link";

export default function AssignmentActions() {
  const gradients = {
    primary: "bg-gradient-to-r from-[#0F6466] to-[#2D9F9C]",
    secondary: "bg-gradient-to-r from-[#4C6EF5] to-[#748FFC]",
    purple: "bg-gradient-to-r from-[#7950F2] to-[#9775FA]",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0F6466] mb-8">Assignments Hub</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Assignment Tile */}
          <Link 
            href="/Components/T/MyClasses/ViewClass/Assignments/Select/Create"
            className={`${gradients.primary} p-8 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl min-h-[250px] flex flex-col justify-between text-white`}
          >
            <div>
              <div className="mb-4 bg-white/20 w-fit p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Creation</h2>
              <p className="opacity-90">Craft new assignments with rich content and deadlines</p>
            </div>
            <div className="flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          {/* Submissions Tile */}
          <Link
            href="/Components/T/MyClasses/ViewClass/Assignments/Select/View"
            className={`${gradients.primary} p-8 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl min-h-[250px] flex flex-col justify-between text-white`}
          >
            <div>
              <div className="mb-4 bg-white/20 w-fit p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Submissions</h2>
              <p className="opacity-90">Review student work and provide feedback</p>
            </div>
            <div className="flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}