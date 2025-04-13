"use client";
import { useState, useEffect } from "react";

interface ClassSlot {
  className: string;
  course: string;
  startTime: string;
  endTime: string;
  room: string;
  
}

interface Student {
  _id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
}

interface AttendanceData {
    date: Date;
    year: number;
    month: number;
    week: number;
    slotNumber: number;
    startTime: string;
    endTime: string;
    className: string;
    course: string;
    room: string;
    teacherId: string;
    students: Array<{
      studentId: string;
      rollNo: string;
      name: string;
      status: string;
    }>;
  }

export default function Attendance() {
  const [classes, setClasses] = useState<ClassSlot[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSlot | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  const [slotNumber, setSlotNumber] = useState(1);
  
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isOnline, setIsOnline] = useState(true);
const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  // Fetch teacher's classes and name
  useEffect(() => {
    const fetchTeacherData = async () => {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      try {
        const classResponse = await fetch(`/api/Component/T/timetable?teacherId=${teacherId}`);
        const classData = await classResponse.json();
        setClasses(classData);

        const teacherResponse = await fetch(`/api/profile?identifier=${teacherId}&userType=Teacher`);
        const teacherData = await teacherResponse.json();
       
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchTeacherData();
  }, []);
     
  // Add online/offline detection
useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  
  const saveOffline = async () => {
    const payload = await preparePayload();
    if (!payload) return;
  
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const preparePayload = async () => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId || !selectedClass || !date) {
      alert("Please fill all required fields");
      return null;
    }
  
    const selectedDate = new Date(date);
    return {
      date: selectedDate,
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      week: getWeekNumber(selectedDate),
      slotNumber,
      startTime,
      endTime,
      className: selectedClass.className,
      course: selectedClass.course,
      room: selectedClass.room,
      teacherId,
      students: students.map((student) => ({
        studentId: student._id,
        rollNo: student.rollNo,
        name: `${student.firstName} ${student.lastName}`,
        status: attendance[student._id] || "P",
      })),
    };
  };
  
  const handleFileUpload = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const payload = JSON.parse(e.target?.result as string);
            
            const response = await fetch("/api/Component/T/MyClasses/ViewClass/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
  
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Upload failed");
            }
            
            // Remove from localStorage if exists
            const offlineEntries = JSON.parse(localStorage.getItem('offlineAttendances') || '[]');
            const updatedEntries = offlineEntries.filter((entry: any) => 
              JSON.stringify(entry) !== JSON.stringify(payload)
            );
            localStorage.setItem('offlineAttendances', JSON.stringify(updatedEntries));
            
            alert("File uploaded successfully: " + file.name);
          } catch (error) {
            console.error("File upload error:", error);
            alert(`Error processing files: ${(error as Error).message}`);
          }
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error processing files");
    }
  };
  
  
  const saveAttendance = async (payload: AttendanceData) => {
    try {
      const response = await fetch("/api/Component/T/MyClasses/ViewClass/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error("Failed to save attendance");
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Attendance submission error:", error);
      alert("Failed to save attendance");
    }
  };
  



  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass?.className) return;

      try {
        const response = await fetch(`/api/Component/T/MyClasses/ViewClass/attendance?className=${selectedClass.className}`);
        const data = await response.json();
        setStudents(data);

        const initialAttendance = data.reduce((acc: Record<string, string>, student: Student) => {
          acc[student._id] = "P";
          return acc;
        }, {});
        setAttendance(initialAttendance);

        setStartTime(selectedClass.startTime);
        setEndTime(selectedClass.endTime);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const handleSubmit = async () => {
    try {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId || !selectedClass || !date || !startTime || !endTime) {
        alert("Please fill all required fields");
        return;
      }
  
      const payload = await preparePayload();
      if (!payload) return;
  
      // Always try to save to database first
      const response = await fetch("/api/Component/T/MyClasses/ViewClass/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error("Failed to save attendance");
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Attendance submission error:", error);
      alert("Online save failed. Use Save Offline instead.");
    }
  };

  const handleSaveOffline = async () => {
    try {
      const payload = await preparePayload();
      if (!payload) return;
  
      // Create JSON blob
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${new Date().toISOString()}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  
      // Save to localStorage for later upload
      const offlineEntries = JSON.parse(localStorage.getItem('offlineAttendances') || '[]');
      offlineEntries.push(payload);
      localStorage.setItem('offlineAttendances', JSON.stringify(offlineEntries));
  
      alert("Attendance saved offline! Don't forget to upload later.");
    } catch (error) {
      console.error("Offline save error:", error);
      alert("Failed to save offline attendance");
    }
  };

  
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "text-green-600 font-bold";
      case "A":
        return "text-red-600 font-bold";
      case "L":
        return "text-blue-600 font-bold";
      default:
        return "";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F6466] mb-6">Mark Attendance</h1>

      {/* Class Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <div>
          <label className="block mb-2 text-[#0F6466]">Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2 text-[#0F6466]">Slot Number (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full p-2 border rounded"
            value={slotNumber}
            onChange={(e) => setSlotNumber(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block mb-2 text-[#0F6466]">Start Time</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2 text-[#0F6466]">End Time</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Class Selection */}
      <div className="mb-8">
        <select
          className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
          onChange={(e) => {
            const index = parseInt(e.target.value);
            setSelectedClass(classes[index] || null);
          }}
          required
        >
          <option value="">Select Class</option>
          {classes.map((cls, index) => (
            <option key={index} value={index}>
              {cls.className} - {cls.course} ({cls.startTime}-{cls.endTime})
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      {students.length > 0 && selectedClass && (
        <div className="overflow-x-auto">
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <h3 className="text-xl font-semibold text-[#0F6466]">Class Details</h3>
            <p>Date: {new Date(date).toLocaleDateString()}</p>
            <p>Slot: #{slotNumber}</p>
            <p>Start Time: {startTime}</p>
            <p>End Time: {endTime}</p>
            <p>Course: {selectedClass.course}</p>
            <p>Room: {selectedClass.room}</p>
           
          </div>

         
<table className="w-full">
  <thead className="bg-[#0F6466] text-white">
    <tr>
      <th className="p-3 text-center">Roll No</th>
      <th className="p-3 text-center">Name</th>
      <th className="p-3 text-center">Status</th>
      <th className="p-3 text-center">Selected Status</th>
    </tr>
  </thead>
  <tbody>
    {students.map((student) => (
      <tr key={student._id} className="border-b hover:bg-gray-50">
        <td className="p-3 text-center">{student.rollNo}</td>
        <td className="p-3 text-center">{student.firstName} {student.lastName}</td>
        <td className="p-3 text-center">
          <select
            className="p-2 border rounded mx-auto block" // Added mx-auto and block
            value={attendance[student._id] || "P"}
            onChange={(e) =>
              setAttendance((prev) => ({
                ...prev,
                [student._id]: e.target.value,
              }))
            }
          >
            <option value="P">Present</option>
            <option value="A">Absent</option>
            <option value="L">Leave</option>
          </select>
        </td>
        <td className={`p-3 text-center ${getStatusColor(attendance[student._id] || "P")}`}>
          {attendance[student._id] || "P"}
        </td>
      </tr>
    ))}
  </tbody>
</table>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-[#0F6466] text-white px-6 py-2 rounded hover:bg-[#0D4B4C]"
          >
            Save Attendance
          </button>
        </div>
      )}
      <div className="flex gap-4 mt-4">


  <button
    onClick={handleSaveOffline}
    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
  >
    Save Offline
  </button>

  <label className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer">
    Upload Offline Files
    <input
      type="file"
      multiple
      accept=".json"
      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      className="hidden"
    />
  </label>
  
 
</div>

    </div>
  );
}