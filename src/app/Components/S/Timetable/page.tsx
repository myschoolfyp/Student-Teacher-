"use client";

import { useEffect, useState } from "react";

interface Period {
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface TimetableDay {
  day: string;
  periods: Period[];
}

// Gradient colors for each day
const dayGradients = [
  "from-[#0F6466] to-[#2D9F9C]",    // Monday
  "from-[#4C6EF5] to-[#748FFC]",    // Tuesday
  "from-[#7950F2] to-[#9775FA]",    // Wednesday
  "from-[#F76707] to-[#FF922B]",    // Thursday
  "from-[#E64980] to-[#F783AC]"     // Friday
];

export default function Timetable() {
  const [timetableData, setTimetableData] = useState<TimetableDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get student's class information from localStorage
  const classLevel = localStorage.getItem("classLevel");
  const classType = localStorage.getItem("classType");
  const className = localStorage.getItem("className") || 
  `Grade ${classLevel} ${classType}`;

  console.log("Class info from localStorage:", {
    classLevel,
    classType,
    className: localStorage.getItem("className")
  });
  console.log("Final className being queried:", className);


  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        if (!classLevel || !classType) {
          throw new Error("Class information not found in storage");
        }
        console.log("Class info from localStorage:", {
          classLevel,
          classType,
          className: localStorage.getItem("className")
        });
        console.log("Final className being queried:", className);
        const response = await fetch(
          `/api/Component/S/Timetable?className=${encodeURIComponent(className)}`
        );
        
        console.log("API URL:", response.url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch timetable");
        }
        
        const data = await response.json();
        setTimetableData(data.days);
      } catch (err: any) {
        setError(err.message || "Error loading timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [className, classLevel, classType]);

  if (loading) return (
    <div className="text-center p-8 text-xl text-[#0F6466]">
      Loading timetable...
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
        <h1 className="text-3xl font-bold text-[#0F6466] mb-8 text-center">
          {className} Timetable
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {timetableData.map((daySchedule, dayIndex) => (
            <div 
              key={daySchedule.day}
              className={`rounded-xl p-4 shadow-lg border border-white/20
                        hover:shadow-xl transition-all duration-300
                        bg-gradient-to-br ${dayGradients[dayIndex % dayGradients.length]}
                        text-white backdrop-blur-sm`}
            >
              <h2 className="text-lg font-semibold mb-3">
                {daySchedule.day}
              </h2>
              
              <div className="space-y-2">
                {daySchedule.periods.map((period) => (
                  <div 
                    key={period.time}
                    className="p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">
                        {period.time}
                      </span>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">
                        {period.room}
                      </span>
                    </div>
                    <p className="font-medium">{period.subject}</p>
                    <p className="text-sm opacity-90">{period.teacher}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}