"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const courseGradients = [
  "from-[#0F6466] to-[#2D9F9C]",
  "from-[#4C6EF5] to-[#748FFC]",
  "from-[#7950F2] to-[#9775FA]",
  "from-[#F76707] to-[#FF922B]",
  "from-[#E64980] to-[#F783AC]",
  "from-[#2F9E44] to-[#69DB7C]",
  "from-[#D6336C] to-[#F06595]",
  "from-[#1864AB] to-[#4DABF7]"
];
const submittedGradients = [
  "from-[#1a1a1a] to-[#404040]",
  "from-[#2d2d2d] to-[#666666]",
  "from-[#333333] to-[#999999]"
];

const assignmentGradients = [
  "from-[#0F6466] to-[#2D9F9C]",
  "from-[#0F6466] via-[#2D9F9C] to-[#4DABF7]",
  "from-[#0F6466] to-[#69DB7C]",
  "from-[#0F6466] to-[#9775FA]",
  "from-[#0F6466] to-[#FF922B]"
];

interface Assignment {
  _id: string;
  assignmentTopic: string;
  description?: string;
  deadline?: string;
  totalMarks?: number;
  file?: {
    fileName: string;
    contentType: string;
  };
  teacherFirstName: string;
  teacherLastName: string;
  submissions: Array<{
    rollNo: string;
    obtainedMarks?: number;  // Add this
    // ... other submission fields
  }>;
}

export default function StudentAssignments() {
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get class info from localStorage
  const classLevel = localStorage.getItem("classLevel");
  const classType = localStorage.getItem("classType");
  const className = localStorage.getItem("className") || `Grade ${classLevel} ${classType}`;
  const rollNo = localStorage.getItem("rollNo");
  const [submittedAssignments, setSubmittedAssignments] = useState<Array<{assignment: Assignment, originalIndex: number}>>([]);
  const [notSubmittedAssignments, setNotSubmittedAssignments] = useState<Array<{assignment: Assignment, originalIndex: number}>>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!classLevel || !classType || !rollNo) {
          throw new Error("Student information not found in storage");
        }

        const response = await fetch(
          `/api/Component/S/Courses?className=${encodeURIComponent(className)}`
        );

        if (!response.ok) throw new Error("Failed to fetch courses");
        
        const data = await response.json();
        setCourses(data.courses);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [className, classLevel, classType, rollNo]);

  const handleCourseSelect = async (course: string) => {
    setSelectedCourse(course);
    try {
      const response = await fetch(
        `/api/Component/S/Assignments?className=${encodeURIComponent(className)}&course=${encodeURIComponent(course)}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch assignments");
      
      const data = await response.json();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    }
  };
  useEffect(() => {
    if (assignments && rollNo) {
      const withIndex = assignments.map((assignment, index) => ({ assignment, originalIndex: index }));
      const submitted = withIndex.filter(({ assignment }) => 
        assignment.submissions.some(sub => sub.rollNo === rollNo)
      );
      const notSubmitted = withIndex.filter(({ assignment }) => 
        !assignment.submissions.some(sub => sub.rollNo === rollNo)
      );
      setSubmittedAssignments(submitted);
      setNotSubmittedAssignments(notSubmitted);
    }
  }, [assignments, rollNo]);

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F6466] mb-4 md:mb-0">
            {className} Assignments
          </h1>
          {selectedCourse && (
            <div className="bg-white px-5 py-2 rounded-full shadow-sm flex items-center">
              <span className="text-[#0F6466] font-medium mr-2">Total Assignments:</span>
              <span className="text-xl font-bold text-[#2D9F9C]">{assignments.length}</span>
            </div>
          )}
        </div>
  
        {!selectedCourse ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {courses.map((course, index) => (
              <button
                key={index}
                onClick={() => handleCourseSelect(course)}
                className={`rounded-xl p-4 min-h-[120px] flex items-center justify-center
                  transform transition-all duration-200 hover:scale-105 hover:shadow-lg
                  bg-gradient-to-br ${courseGradients[index % courseGradients.length]}
                  shadow-sm backdrop-blur-sm border border-white/20 cursor-pointer`}
              >
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-1">
                    {course.split('-')[0].trim()}
                  </p>
                  <p className="text-white/90 text-sm">
                    {course.split('-')[1].trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setSelectedCourse(null)}
              className="mb-6 px-4 py-2 bg-[#0F6466] text-white rounded-lg hover:bg-[#2D9F9C] transition-colors"
            >
              ← Back to Courses
            </button>
  
            {/* Pending Assignments Section */}
            {notSubmittedAssignments.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#0F6466] mb-6">Pending Assignments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notSubmittedAssignments.map(({ assignment, originalIndex }) => (
                    <div 
                      key={assignment._id}
                      className={`rounded-xl p-6 shadow-lg border border-white/20
                        bg-gradient-to-br ${assignmentGradients[originalIndex % assignmentGradients.length]}
                        transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {assignment.assignmentTopic}
                          </h3>
                          <p className="text-white/90 text-sm">
                            By {assignment.teacherFirstName} {assignment.teacherLastName}
                          </p>
                        </div>
                        <span className="bg-white text-[#0F6466] px-3 py-1 rounded-full text-sm font-medium">
                          {assignment.totalMarks || 'N/A'} Marks
                        </span>
                      </div>
  
                      {assignment.description && (
                        <p className="text-white/80 mb-4">{assignment.description}</p>
                      )}
  
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-white/90">
                            Deadline: {assignment.deadline ? 
                              new Date(assignment.deadline).toLocaleDateString() : 
                              'No deadline'}
                          </p>
                        {assignment.file && (
  <a 
    href={`/api/files?fileName=${encodeURIComponent(assignment.file.fileName)}`}
    className="text-white hover:underline text-sm flex items-center mt-1"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Download File
  </a>
)}
                        </div>
                        <Link
                          href={`/Components/S/Assignments/Submit?assignmentId=${assignment._id}`}
                          className="bg-white text-[#0F6466] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                        >
                          Submit Work
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Submitted Assignments Section */}
            {submittedAssignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#0F6466] mb-6">Submitted Assignments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submittedAssignments.map(({ assignment, originalIndex }) => {
                    const studentSubmission = assignment.submissions.find(sub => sub.rollNo === rollNo);
                    const obtainedMarks = studentSubmission?.obtainedMarks;
  
                    return (
                      <div 
                        key={assignment._id}
                        className={`rounded-xl p-6 shadow-lg border border-white/20
                          bg-gradient-to-br ${submittedGradients[originalIndex % submittedGradients.length]}
                          transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group relative`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-100 mb-2">
                              {assignment.assignmentTopic}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              By {assignment.teacherFirstName} {assignment.teacherLastName}
                            </p>
                          </div>
                          <span className="bg-white text-[#333] px-3 py-1 rounded-full text-sm font-medium">
                            {obtainedMarks !== undefined 
                              ? `${obtainedMarks}/${assignment.totalMarks}` 
                              : `Total: ${assignment.totalMarks || 'N/A'}`}
                          </span>
                        </div>
  
                        {assignment.description && (
                          <p className="text-gray-300 mb-4">{assignment.description}</p>
                        )}
  
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-300">
                              Deadline: {assignment.deadline ? 
                                new Date(assignment.deadline).toLocaleDateString() : 
                                'No deadline'}
                            </p>
                            {assignment.file && (
                              <a 
                              href={`/api/files?fileName=${encodeURIComponent(assignment.file.fileName)}`}
                                className="text-gray-200 hover:underline text-sm flex items-center mt-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download File
                              </a>
                            )}
                          </div>
                        </div>
  
                        {/* Hover View Button */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 bottom-4">
                          <Link
                            href={`/Components/S/Assignments/View?assignmentId=${assignment._id}`}
                            className="bg-white text-[#333] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-md"
                          >
                            View Submission
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}