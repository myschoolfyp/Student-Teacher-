// app/Components/S/Assignments/View/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ViewSubmission() {
  const [submission, setSubmission] = useState<{
    submissionText?: string;
    file?: { fileName: string };
    submittedAt: Date;
  } | null>(null);
  const [newSubmissionText, setNewSubmissionText] = useState("");
  const [newSubmissionFile, setNewSubmissionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        if (!assignmentId) throw new Error("Assignment ID not found");
        
        const rollNo = localStorage.getItem("rollNo");
        if (!rollNo) throw new Error("Student information not found");

        const response = await fetch(
          `/api/Component/S/Assignments/View?assignmentId=${encodeURIComponent(assignmentId)}&rollNo=${encodeURIComponent(rollNo)}`
        );
        
        const data = await response.json();
        if (response.ok) {
          setSubmission(data.submission);
          setNewSubmissionText(data.submission?.submissionText || "");
        } else {
          throw new Error(data.error || "Failed to fetch submission");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError("");
      
      const rollNo = localStorage.getItem("rollNo");
      const studentName = localStorage.getItem("studentName");
      if (!assignmentId || !rollNo || !studentName) {
        throw new Error("Missing required information");
      }

      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("rollNo", rollNo);
      if (newSubmissionText) formData.append("submissionText", newSubmissionText);
      if (newSubmissionFile) formData.append("submissionFile", newSubmissionFile);

      const response = await fetch("/api/Component/S/Assignments/View", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Update failed");
      
      // Refresh submission data
      const updatedData = await response.json();
      setSubmission(updatedData.submission);
      alert("Submission updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0F6466] mx-auto"></div>
          <p className="mt-4 text-lg text-[#0F6466]">Loading submission...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Your Submission
              </h1>
              <p className="text-gray-600 mt-2">
                {submission?.submittedAt && 
                  `Submitted on ${new Date(submission.submittedAt).toLocaleDateString()}`
                }
              </p>
            </div>
            <Link
              href="/Components/S/Assignments"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Assignments
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Notes
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all"
                value={newSubmissionText}
                onChange={(e) => setNewSubmissionText(e.target.value)}
                placeholder="Update your submission comments..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded File
              </label>
              {submission?.file ? (
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2 text-gray-500" 
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
                    <span className="text-gray-700">
                      {submission.file.fileName}
                    </span>
                  </div>
                  <a
                    href={`/api/files/${submission.file.fileName}`}
                    className="text-blue-600 hover:text-blue-800"
                    download
                  >
                    Download
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 italic">No file submitted</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update File
              </label>
              <input
                type="file"
                onChange={(e) => setNewSubmissionFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.png"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleUpdate}
            disabled={isUpdating || (!newSubmissionFile && newSubmissionText === submission?.submissionText)}
            className={`w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 ${isUpdating ? 'opacity-70' : ''}`}
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Submission'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}