
"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";

interface SubmissionFile {
  data: string;
  contentType: string;
  fileName: string;
}

interface Submission {
  rollNo: string;
  studentName: string;
  submissionText?: string;
  file?: SubmissionFile;
  obtainedMarks?: number | null;
  submittedAt: Date;
}

export default function ViewSubmissions() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [savedMarks, setSavedMarks] = useState<Record<string, number>>({});

  const gradients = {
    card: "bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef]",
    button: "bg-gradient-to-r from-[#4C6EF5] to-[#748FFC]",
    savedButton: "bg-gradient-to-r from-[#ff4757] to-[#ff6b81]",
  };

  useEffect(() => {
    if (!assignmentId) return;
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `/api/Component/T/MyClasses/ViewClass/assignments/Select/view/submissions?assignmentId=${assignmentId}`
        );
        const data = await response.json();
        setSubmissions(data.submissions || []);
        
        // Initialize saved marks
        const initialSaved: Record<string, number> = {};
        data.submissions?.forEach((s: Submission) => {
          if (s.obtainedMarks !== null && s.obtainedMarks !== undefined) {
            initialSaved[s.rollNo] = s.obtainedMarks;
          }
        });
        setSavedMarks(initialSaved);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const handleMarkChange = (rollNo: string, value: string) => {
    setMarks(prev => ({ ...prev, [rollNo]: value }));
  };

  const saveMark = async (rollNo: string) => {
    const newMark = marks[rollNo];
    if (!newMark || isNaN(Number(newMark))) return;

    try {
      const response = await fetch(
        `/api/Component/T/MyClasses/ViewClass/assignments/Select/view/submissions?assignmentId=${assignmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rollNo, obtainedMarks: Number(newMark) }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setSubmissions(updated.submissions);
        setSavedMarks(prev => ({ ...prev, [rollNo]: Number(newMark) }));
        setMarks(prev => ({ ...prev, [rollNo]: "" }));
      }
    } catch (error) {
      console.error("Error saving mark:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f8f5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#0F6466]">
          Student Submissions
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F6466] mx-auto"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No submissions found for this assignment
          </div>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.rollNo}
              className={`${gradients.card} rounded-xl shadow-lg p-6 mb-6 transition-transform hover:scale-[1.01]`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#2D9F9C]">
                    {submission.studentName}
                  </h3>
                  <p className="text-gray-600 mb-2">Roll No: {submission.rollNo}</p>
                  
                  {submission.submissionText && (
                    <div className="mb-3">
                      <p className="text-gray-700">{submission.submissionText}</p>
                    </div>
                  )}

                  {submission.file && (
                    <a
                      href={`data:${submission.file.contentType};base64,${submission.file.data}`}
                      download={submission.file.fileName}
                      className="inline-block text-[#4C6EF5] hover:underline"
                    >
                      📎 {submission.file.fileName}
                    </a>
                  )}

                  <div className="mt-3 text-sm text-gray-500">
                    Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={savedMarks[submission.rollNo]?.toString() || "Enter marks"}
                      value={marks[submission.rollNo] || ""}
                      onChange={(e) => handleMarkChange(submission.rollNo, e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4C6EF5]"
                      min="0"
                    />
                    <button
                      onClick={() => saveMark(submission.rollNo)}
                      className={`px-4 py-2 text-white rounded-lg ${
                        savedMarks[submission.rollNo] 
                          ? gradients.savedButton
                          : gradients.button
                      }`}
                    >
                      {savedMarks[submission.rollNo] ? `Saved: ${savedMarks[submission.rollNo]}` : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}