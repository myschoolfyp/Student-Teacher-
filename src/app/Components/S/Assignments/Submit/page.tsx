"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const submitGradients = [
  "from-[#0F6466] to-[#2D9F9C]",
  "from-[#1864AB] to-[#4DABF7]",
  "from-[#2F9E44] to-[#69DB7C]"
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
  studentSubmission?: Array<{
    obtainedMarks?: number;
    totalMarks?: number;
    submittedAt: Date;
  }>;
}

export default function SubmitAssignment() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        if (!assignmentId) {
          throw new Error("Assignment ID not found");
        }
        // In page.tsx - Inside the fetchAssignment function
const response = await fetch(
  `/api/Component/S/Assignments/Submit?assignmentId=${encodeURIComponent(assignmentId)}` // <-- Add encoding here
);

        
        const data = await response.json();
        setAssignment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
  
      // Get required info from localStorage
      const rollNo = localStorage.getItem("rollNo");
      const studentName = localStorage.getItem("studentName");
      const assignmentId = searchParams.get("assignmentId");
  
      if (!assignmentId || !rollNo || !studentName) {
        throw new Error("Missing required student information");
      }
  
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("rollNo", rollNo);
      formData.append("studentName", studentName);
  
      if (submissionText) formData.append("submissionText", submissionText);
      if (submissionFile) formData.append("submissionFile", submissionFile);
  
      // Submit logic remains same
      const response = await fetch("/api/Component/S/Assignments/Submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

         // Show confirmation and redirect
    alert("Assignment submitted successfully!");
    router.push("/Components/S/Assignments");
  
      // Handle response...
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F6466] mx-auto"></div>
          <p className="mt-4 text-lg text-[#0F6466]">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            href="/Components/S/Assignments"
            className="px-4 py-2 bg-[#0F6466] text-white rounded-lg hover:bg-[#2D9F9C] transition-colors"
          >
            ← Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Assignment Not Found</h3>
          <Link 
            href="/Components/S/Assignments"
            className="px-4 py-2 bg-[#0F6466] text-white rounded-lg hover:bg-[#2D9F9C] transition-colors"
          >
            ← Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const gradientClass = submitGradients[Math.floor(Math.random() * submitGradients.length)];

  
    return (
  <div className="min-h-screen bg-gray-50 p-4 md:p-8">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Submit Assignment
            </h1>
            <p className="text-gray-600 mt-2">
              {assignment?.assignmentTopic || "Assignment Submission"}
            </p>
          </div>
          <Link
            href="/Components/S/Assignments"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Assignment Details */}
        {assignment && (
          <div className="mb-8 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Assignment Brief
              </h3>
              <p className="text-gray-600">
                {assignment.description || "No description provided"}
              </p>
              {assignment.file && (
                <div className="mt-4">
                  <a 
                    href={`/api/files/${assignment.file.fileName}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                      />
                    </svg>
                    Download Assignment File
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Teacher</p>
                <p className="text-gray-900">
                  {assignment.teacherFirstName} {assignment.teacherLastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Deadline</p>
                <p className="text-gray-900">
                  {assignment.deadline ? 
                    new Date(assignment.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 
                    'No deadline'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="space-y-6">
          {/* Text Submission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Notes
              <span className="text-gray-500 ml-2">(optional)</span>
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Add any additional comments..."
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
              <span className="text-gray-500 ml-2">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.png"
                />
                <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg 
                  hover:border-blue-500 transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 mr-2 text-gray-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <span className="text-gray-700">
                    {submissionFile ? submissionFile.name : "Choose file..."}
                  </span>
                </div>
              </label>
              {submissionFile && (
                <button
                  onClick={() => setSubmissionFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!submissionFile && !submissionText)}
            className={`w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Assignment'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}