
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

// Handle submissions operations
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
    }

    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const submissions = assignment.submissions.map((sub: any) => ({
      ...sub.toObject(),
      file: sub.file ? {
        ...sub.file,
        data: sub.file.data.toString("base64")
      } : null,
      submittedAt: sub.submittedAt || sub.createdAt
    }));

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const { rollNo, obtainedMarks } = await request.json();

    if (!assignmentId || !rollNo || obtainedMarks === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const submissionIndex = assignment.submissions.findIndex(
      (s: any) => s.rollNo === rollNo
    );

    if (submissionIndex === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    assignment.submissions[submissionIndex].obtainedMarks = obtainedMarks;
    await assignment.save();

    const updatedSubmissions = assignment.submissions.map((sub: any) => ({
      ...sub.toObject(),
      file: sub.file ? {
        ...sub.file,
        data: sub.file.data.toString("base64")
      } : null
    }));

    return NextResponse.json({ submissions: updatedSubmissions });
  } catch (error: unknown) {
    console.error("Error updating marks:", error);
    return NextResponse.json(
      { error: "Failed to update marks" },
      { status: 500 }
    );
  }
}



