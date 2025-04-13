"use client";
import { useState, useEffect } from "react";

interface ClassCourse {
  className: string;
  course: string;
  teacherId: string;
}

export default function CreateAssignment() {
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassCourse | null>(null);
  const [assignmentTopic, setAssignmentTopic] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [fileError, setFileError] = useState("");

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
    const fetchTeacherName = async () => {
      if (!selectedClass?.teacherId) return;
      
      try {
        // Send teacherId to the same create endpoint
        const response = await fetch(`/api/Component/T/MyClasses/ViewClass/assignments/Select/create?teacherId=${selectedClass.teacherId}`);
        const data = await response.json();
        setTeacherName(`${data.firstName} ${data.lastName}`);
      } catch (error) {
        console.error("Error fetching teacher:", error);
      }
    };
    fetchTeacherName();
  }, [selectedClass]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 1024 * 1024) {
      setFileError("File size must be less than 1MB");
      return;
    }

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
      setFileError("Only PDF and Word documents are allowed");
      return;
    }

    setFile(selectedFile);
    setFileError("");
  };

  const handleSubmit = async () => {
    try {
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId || !selectedClass || !assignmentTopic) { // Changed to assignmentTopic
        alert("Assignment topic and class selection are required");
        return;
      }
  
      // Validate total marks
    if (totalMarks) {
      const marks = parseInt(totalMarks);
      if (isNaN(marks)){
        alert("Invalid total marks");
        return;
      }
      if (marks < 0 || marks > 100) {
        alert("Total marks must be between 0 and 100");
        return;
      }
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("className", selectedClass.className);
    formData.append("course", selectedClass.course);
    formData.append("assignmentTopic", assignmentTopic); // Changed from header
    if (description) formData.append("description", description);
    if (deadline) formData.append("deadline", deadline);
    if (totalMarks) formData.append("totalMarks", totalMarks);
    formData.append("teacherId", teacherId);

      const response = await fetch("/api/Component/T/MyClasses/ViewClass/assignments/Select/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }

      alert("Assignment created successfully!");
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create assignment";
      console.error("Assignment creation error:", errorMessage);
      alert(errorMessage);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className={`${gradients.primary} p-6 rounded-2xl shadow-lg mb-8`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Create Assignment</h1>
          <p className="text-white/90 mt-2">Design and publish new academic tasks</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
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
            <div className="space-y-6">
              <div className={`${gradients.primary} p-6 rounded-xl text-white`}>
                <h3 className="text-xl font-semibold mb-2">Class Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p>Class: {selectedClass.className}</p>
                  <p>Course: {selectedClass.course}</p>
                  <p>Teacher: {teacherName}</p>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#0F6466] font-medium">Assignment Topic*</label>
                <input
  type="text"
  className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C]"
  value={assignmentTopic}
  onChange={(e) => setAssignmentTopic(e.target.value)}
  required
/>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-[#0F6466] font-medium">Total Marks (max 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                     className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C]"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[#0F6466] font-medium">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C]"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#0F6466] font-medium">Description</label>
                <textarea
                  className="w-full p-3 border-2 border-[#0F6466]/20 rounded-lg focus:ring-2 focus:ring-[#2D9F9C] h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-[#0F6466] font-medium">Attachment (PDF/DOC, max 1MB)</label>
                <label className={`${gradients.purple} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md inline-flex items-center cursor-pointer`}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {file ? file.name : "Choose File"}
                </label>
                {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
              </div>

              <button
                onClick={handleSubmit}
                className={`${gradients.primary} text-white px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md text-lg font-semibold`}
              >
                Publish Assignment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}