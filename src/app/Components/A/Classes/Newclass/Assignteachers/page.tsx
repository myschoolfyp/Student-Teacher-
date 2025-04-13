"use client";
import { useState, useEffect } from "react";

interface ClassData {
  _id: string; 
  classLevel: string;
  className: string;
  stream: string;
  courses: string[];
  teachers?: { course: string; teacher: string;
  classId: string;  
   }[];
 
}
interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
  cnic: string;
  assignments?: Array<{
    class: string;
    course: string;
  }>;
}
export default function TeacherAssignment() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [assignments, setAssignments] = useState<{ 
    course: string; 
    teacher: string;
    teacherId: string;
    cnic: string;
    classId: string; // Add this line
  }[]>([]);
  // Fetch classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/Component/A/classes/newclass/assignteachers?action=fetchClasses");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch teachers when department is selected
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedDepartment) {
        try {
          const response = await fetch(
            `/api/Component/A/classes/newclass/assignteachers?action=fetchTeachers&department=${selectedDepartment}`
          );
          const data = await response.json();
          setTeachers(data);
        } catch (err) {
          console.error("Error fetching teachers:", err);
        }
      }
    };
    fetchTeachers();
  }, [selectedDepartment]);

  // Handle teacher assignment to a course
  const handleAssignment = (course: string, teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    const selectedClassObj = classes.find(cls => cls.className === selectedClass);
    
    if (teacher && selectedClassObj) {
      setAssignments((prev) => [
        ...prev.filter((a) => a.course !== course),
        { 
          course,
          teacher: `${teacher.firstName} ${teacher.lastName}`,
          teacherId: teacher._id,
          cnic: teacher.cnic,
          classId: selectedClassObj._id // Add class ID
        },
      ]);
    }
  }
  // Handle assigning one teacher to all courses
  const handleAssignToAll = (teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    const selectedClassObj = classes.find(cls => cls.className === selectedClass);
    
    if (teacher && selectedClassObj) {
      const classCourses = selectedClassObj.courses || [];
      const newAssignments = classCourses.map((course) => ({
        course,
        teacher: `${teacher.firstName} ${teacher.lastName}`,
        teacherId: teacher._id,
        cnic: teacher.cnic,
        classId: selectedClassObj._id // Add class ID
      }));
      setAssignments(newAssignments);
    }
  };
  

  // Handle submission
  const handleSubmit = async () => {
    if (!selectedClass || assignments.length === 0) return;
  
    const selectedClassDoc = classes.find(c => c.className === selectedClass);
  if (!selectedClassDoc?._id) {
    alert("Missing class ID - please refresh and try again");
    return;
  }
    setIsSubmitting(true);
    setSubmissionStatus(null);
  
    try {
      const response = await fetch("/api/Component/A/classes/newclass/assignteachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: selectedClass,
          classId: selectedClassDoc._id, // Send class ID separately
          teachers: assignments.map((a) => ({
            course: a.course,
            teacherId: a.teacherId,
            classId: a.classId
          })),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignments");
      }
  
      const result = await response.json();
      setSubmissionStatus({ success: true, message: result.message });
  
      // Update local state with the new teachers data
      setClasses((prev) =>
        prev.map((cls) =>
          cls.className === selectedClass
            ? { 
                ...cls, 
                teachers: assignments.map(a => ({
                  course: a.course,
                  teacher: a.teacher,
                  classId: a.classId // Explicitly include classId
                }))
              }
            : cls
        )
      );
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit assignments. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // In page.tsx before submission
const invalidTeachers = assignments.some(a => 
  !teachers.some(t => t._id === a.teacherId)
);
if (invalidTeachers) {
  alert("One or more selected teachers no longer exist");
  return;
}
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-[#0F6466] mb-8 text-center">Teacher Assignment</h1>

      {/* Class Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Class</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls.className} value={cls.className}>
              {`${cls.classLevel} - ${cls.stream} - ${cls.className}`}
            </option>
          ))}
        </select>
      </div>

      {/* Show Courses and Department Selection */}
      {selectedClass && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Enrolled Courses</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <ul className="list-disc pl-6">
                {classes
                  .find((cls) => cls.className === selectedClass)
                  ?.courses.map((course, index) => (
                    <li key={index} className="text-gray-700">
                      {course}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Department Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Select Department for Teachers</h2>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-3 border-2 border-[#0F6466] rounded-lg"
            >
              <option value="">Select Department</option>
              {['Arts', 'Maths', 'Chem', 'Physics', 'English', 'Urdu', 'Islamiat', 'History'].map(
                (dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                )
              )}
            </select>
          </div>
        </>
      )}

      {/* Teacher Assignment Section */}
      {selectedDepartment && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#0F6466] mb-4">Assign Teachers</h2>

          {/* Assign to All Courses */}
          <div className="mb-6">
  <h3 className="text-md font-medium text-[#0F6466] mb-2">Assign One Teacher to All Courses</h3>
  <select
    onChange={(e) => handleAssignToAll(e.target.value)}
    className="w-full p-2 border rounded-md text-sm"
  >
   <option value="">Select Teacher</option>
  {teachers.map((teacher) => (
    <option key={teacher._id} value={teacher._id}>
      {`${teacher.firstName} ${teacher.lastName} (${teacher.cnic})`}
    </option>
  ))}
  </select>
</div>

          {/* Assign Teachers to Individual Courses */}
          <div className="space-y-4">
            {classes
              .find((cls) => cls.className === selectedClass)
              ?.courses.map((course) => (
                <div key={course} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
                  <span className="flex-1 font-medium text-gray-700">{course}</span>
                  <select
  onChange={(e) => handleAssignment(course, e.target.value)}
  value={assignments.find((a) => a.course === course)?.teacherId || ""}
  className="p-2 border rounded-md flex-1"
>
  <option value="">Select Teacher</option>
  {teachers.map((teacher) => (
    <option key={teacher._id} value={teacher._id}>
      {`${teacher.firstName} ${teacher.lastName}`}
    </option>
  ))}
</select>
                </div>
              ))}
          </div>
        </div>
      )}
{/* Assignment Summary and Submission Section */}
{assignments.length > 0 && (
  <div className="mt-8 flex flex-col gap-6">
    {/* Assignment Summary */}
    <div className="p-6 bg-white rounded-xl border border-[#2D9596]/20 shadow-lg">
      <h3 className="text-2xl font-bold text-[#0F6466] mb-4">Assignment Summary</h3>
      <div className="space-y-3">
        {assignments.map((assignment, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-[#f0f7f7] transition-colors"
          >
            <span className="font-medium text-gray-700">{assignment.course}</span>
            <span className="text-[#2D9596] font-semibold">
              {assignment.teacher} <span className="text-gray-500">({assignment.cnic})</span>
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Submit Button */}
    <div className="flex justify-center">
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-gradient-to-r from-[#2D9596] to-[#1d7879] text-white 
          px-10 py-4 rounded-xl font-bold text-lg
          shadow-xl hover:shadow-2xl hover:scale-[1.02] 
          transition-all duration-300 transform 
          disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed
          flex items-center justify-center gap-3 mx-auto
          ring-2 ring-white/10 hover:ring-[#2D9596]/30"
      >
        {isSubmitting ? (
          <>
            <svg 
              className="animate-spin h-6 w-6 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="tracking-wide">Submitting...</span>
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white/90" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="tracking-wide">Confirm Assignments</span>
          </>
        )}
      </button>
    </div>
  </div>
)}

      {/* Submission Status */}
      {submissionStatus && (
        <div
          className={`mt-4 p-4 rounded-md text-center ${
            submissionStatus.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submissionStatus.message}
        </div>
      )}
    </div>
  );
}