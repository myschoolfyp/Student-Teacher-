import { NextResponse } from "next/server";
import mongoose from "mongoose";
import TeacherModel from "@/models/Teacher";
import AssignmentModel from "@/models/Assignment";

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const formData = await request.formData();

    // Validate required fields
    const requiredFields = ['assignmentTopic', 'className', 'course', 'teacherId'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get totalMarks from formData
    const totalMarks = formData.get("totalMarks");
    
    if (totalMarks) {
      const marks = Number(totalMarks);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        return NextResponse.json(
          { error: "Total marks must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    // File validation
    const file = formData.get("file") as File;
    let buffer: Buffer | null = null;
    let fileData = null;

    if (file && file.size > 0) {
      if (file.size > 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 1MB" },
          { status: 400 }
        );
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Only PDF and Word documents are allowed" },
          { status: 400 }
        );
      }

      // Convert file to Buffer
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      fileData = {
        data: buffer,
        contentType: file.type,
        fileName: file.name
      };
    }

    // Get teacher details
    const teacherId = formData.get("teacherId") as string;
    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Create assignment payload
    const assignment = new AssignmentModel({
      assignmentTopic: formData.get("assignmentTopic"),
      className: formData.get("className"),
      course: formData.get("course"),
      description: formData.get("description"),
      deadline: formData.get("deadline") ? new Date(formData.get("deadline") as string) : undefined,
      totalMarks: totalMarks ? Number(totalMarks) : undefined,
      file: fileData,
      teacherId: teacher._id,
      teacherFirstName: teacher.firstName,
      teacherLastName: teacher.lastName
    });

    // Save to database
    await assignment.save();

    return NextResponse.json(
      { message: "Assignment created successfully" },
      { status: 201 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating assignment:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID required" },
        { status: 400 }
      );
    }

    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      firstName: teacher.firstName,
      lastName: teacher.lastName
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}