
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");
    const course = searchParams.get("course");
    const teacherId = searchParams.get("teacherId");

    if (!className || !course || !teacherId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const assignments = await AssignmentModel.find({
      className,
      course,
      teacherId
    }).sort({ createdAt: -1 });

    const enhancedAssignments = assignments.map(assignment => ({
      _id: assignment._id,
      assignmentTopic: assignment.assignmentTopic,
      description: assignment.description,
      totalMarks: assignment.totalMarks,
      deadline: assignment.deadline,
      createdAt: assignment.createdAt,
      submissionsCount: assignment.submissions?.length || 0
    }));

    return NextResponse.json({
      total: assignments.length,
      assignments: enhancedAssignments
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching assignments:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
// Add this DELETE handler after the GET handler in route.ts
export async function DELETE(request: Request) {
    try {
      await connectDB();
      const { searchParams } = new URL(request.url);
      const assignmentId = searchParams.get("assignmentId");
  
      if (!assignmentId) {
        return NextResponse.json(
          { error: "Missing assignment ID" },
          { status: 400 }
        );
      }
  
      const deletedAssignment = await AssignmentModel.findByIdAndDelete(assignmentId);
      
      if (!deletedAssignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "Assignment deleted successfully" },
        { status: 200 }
      );
  
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error deleting assignment:", errorMessage);
      return NextResponse.json(
        { error: "Failed to delete assignment" },
        { status: 500 }
      );
    }
  }