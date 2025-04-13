"use client";
import Link from "next/link";

export default function ResultActions() {
  const gradients = {
    blue: "bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]",
    indigo: "bg-gradient-to-r from-[#6366F1] to-[#818CF8]",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0F6466] mb-8">Results Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create New Tile */}
          <Link 
            href="/Components/A/Results/Create"
            className={`${gradients.blue} p-8 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl min-h-[250px] flex flex-col justify-between text-white`}
          >
            <div>
              <div className="mb-4 bg-white/20 w-fit p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4m12 0a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Create New</h2>
              <p className="opacity-90">Generate new result entries and performance reports</p>
            </div>
            <div className="flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          {/* View Results Tile */}
          <Link
            href="/Components/A/Results/View"
            className={`${gradients.indigo} p-8 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl min-h-[250px] flex flex-col justify-between text-white`}
          >
            <div>
              <div className="mb-4 bg-white/20 w-fit p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">View Results</h2>
              <p className="opacity-90">Analyze historical data and student performance trends</p>
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