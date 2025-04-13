
"use client";
import { useState, useEffect } from "react";


import { useSearchParams, useRouter } from "next/navigation";

import Link from "next/link";

interface ClassCourse {
  className: string;
  course: string;
  teacherId: string;
}

interface Assignment {
  _id: string;
  assignmentTopic: string;
  description?: string;
  totalMarks?: number;
  deadline: Date;
  createdAt: Date;
  submissionsCount: number;

}



export default function ViewAssignments() {
    const router = useRouter();
  
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassCourse | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [loading, setLoading] = useState(false);
 
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");
  const editMode = searchParams.get("edit") === "true";



  const gradients = {
    primary: "bg-gradient-to-r from-[#0F6466] to-[#2D9F9C]",
    secondary: "bg-gradient-to-r from-[#4C6EF5] to-[#748FFC]",
    purple: "bg-gradient-to-r from-[#7950F2] to-[#9775FA]",
  };



  

  

  useEffect(() => {
    const fetchAssignedClasses = async () => {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) return;

      try {
        const response = await fetch(`/api/Component/T/timetable?teacherId=${teacherId}`);
        const data = await response.json();
        
        const uniqueClasses: ClassCourse[] = [];
        const seenCombinations = new Set<string>();

        data.forEach((cls: any) => {
          const combination = `${cls.className}-${cls.course}`;
          if (!seenCombinations.has(combination)) {
            seenCombinations.add(combination);
            uniqueClasses.push({
              className: cls.className,
              course: cls.course,
              teacherId: cls.teacherId || teacherId
            });
          }
        });

        setClasses(uniqueClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchAssignedClasses();
  }, []);
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedClass) return;
      setLoading(true);
      
      try {
        const response = await fetch(
          `/api/Component/T/MyClasses/ViewClass/assignments/Select/view?className=${selectedClass.className}&course=${selectedClass.course}&teacherId=${selectedClass.teacherId}`
        );
        const data = await response.json();
        
        // Convert deadline strings to Date objects
        const assignmentsWithDates = data.assignments.map((a: any) => ({
          ...a,
          deadline: new Date(a.deadline),
          createdAt: new Date(a.createdAt)
        }));
        
        setAssignments(assignmentsWithDates);
        setTotalAssignments(data.total);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [selectedClass]);
  // Update the PUT request body in handleUpdate function
  
  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    try {
      const response = await fetch(
        `/api/Component/T/MyClasses/ViewClass/assignments/Select/view?assignmentId=${assignmentToDelete}`,
        {
          method: 'DELETE'
        }
      );
      
      if (response.ok) {
        setAssignments(prev => prev.filter(a => a._id !== assignmentToDelete));
        setTotalAssignments(prev => prev - 1);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedClass) return;
      setLoading(true);
      
      try {
        const response = await fetch(
            `/api/Component/T/MyClasses/ViewClass/assignments/Select/view?className=${selectedClass.className}&course=${selectedClass.course}&teacherId=${selectedClass.teacherId}`
          );
        const data = await response.json();
        
        setAssignments(data.assignments);
        setTotalAssignments(data.total);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [selectedClass]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className={`${gradients.primary} p-6 rounded-2xl shadow-lg mb-8`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Manage Assignments</h1>
          <p className="text-white/90 mt-2">View and manage created assignments</p>
        </div>
  
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAssignmentToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  className="bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

  
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          {/* Class & Course Selection */}
          <div className="mb-8 relative">
            <div className={`absolute inset-0 ${gradients.secondary} rounded-xl opacity-20`}></div>
            <select
              className="relative w-full p-4 bg-white/80 border-2 border-[#4C6EF5]/30 rounded-xl focus:ring-2 focus:ring-[#4C6EF5] z-10"
              onChange={(e) => {
                const selected = classes[Number(e.target.value)];
                setSelectedClass(selected);
              }}
              required
            >
              <option value="">Select Class & Course</option>
              {classes.map((cls, index) => (
                <option key={index} value={index}>
                  {cls.className} - {cls.course}
                </option>
              ))}
            </select>
          </div>
  
          {selectedClass && (
            <div>
              {/* Class Summary */}
              <div className={`${gradients.primary} p-6 rounded-xl text-white mb-8`}>
                <h3 className="text-xl font-semibold mb-2">Class Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <p>Class: {selectedClass.className}</p>
                  <p>Course: {selectedClass.course}</p>
                  <p>Total Assignments: {totalAssignments}</p>
                </div>
              </div>
  
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F6466] mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {assignments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {assignments.map((assignment) => (
  <div
    key={assignment._id}
    className={`${gradients.purple} relative p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow`}
  >
    {/* Assignment Header */}
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold">{assignment.assignmentTopic}</h3>
      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
        {new Date(assignment.createdAt).toLocaleDateString()}
      </span>
    </div>

    {/* Assignment Details */}
    <div className="space-y-2">
      {assignment.description && (
        <p className="opacity-90 line-clamp-3">{assignment.description}</p>
      )}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {assignment.totalMarks && (
          <div>
            <p className="text-sm opacity-75">Total Marks</p>
            <p className="font-medium">{assignment.totalMarks}</p>
          </div>
        )}
        {assignment.deadline && (
          <div>
            <p className="text-sm opacity-75">Deadline</p>
            <p className="font-medium">
              {new Date(assignment.deadline).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      <div className="pt-4 mt-4 border-t border-white/20">
        <p className="text-sm opacity-75">
          Submissions Received: {assignment.submissionsCount || 0}
        </p>
      </div>
    </div>

    {/* Button Group */}
    <div className="absolute bottom-4 right-4 flex gap-2">
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAssignmentToDelete(assignment._id);
          setIsDeleteModalOpen(true);
        }}
        className="bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md"
      >
        Delete
      </button>
     
      {/* New View Button */}
      <Link
        href={`/Components/T/MyClasses/ViewClass/Assignments/Select/View/Submissions?assignmentId=${assignment._id}`}
      >
        <button
          className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md"
        >
          View
        </button>
      </Link>
    </div>
  </div>
))}
                    </div>
                  ) : (
                    <div className={`${gradients.secondary} p-6 rounded-xl text-white text-center`}>
                      {assignments === null 
                        ? "Error loading assignments" 
                        : "No assignments found for this class/course combination"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}
