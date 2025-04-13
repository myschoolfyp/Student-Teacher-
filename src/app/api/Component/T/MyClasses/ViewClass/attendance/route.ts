// src/app/api/Component/T/attendance/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClassModel from "@/models/Class";
import StudentModel from "@/models/Student";
import AttendanceModel from "@/models/Attendance";

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

// Updated GET handler in route.ts
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");

    if (!className) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const classData = await ClassModel.findOne({ className });
    if (!classData) return NextResponse.json([], { status: 200 });

    // Fetch students by their IDs (not rollNo)
    const students = await StudentModel.find({
      _id: { $in: classData.students }, // Changed from rollNo to _id
    }).select("_id rollNo firstName lastName");

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    await connectDB();
    const payload = await request.json();

    // Validate required fields
    const requiredFields = [
      "date",
      "year",
      "month",
      "week",
      "slotNumber",
      "className",
      "course",
      "room",
      "teacherId",
      "students",
    ];

    const missingFields = requiredFields.filter((field) => !payload[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Check for existing attendance
    const existingAttendance = await AttendanceModel.findOne({
      date: payload.date,
      className: payload.className,
      slotNumber: payload.slotNumber,
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance already recorded for this slot" },
        { status: 409 }
      );
    }

    // Save new attendance
    const newAttendance = new AttendanceModel(payload);
    await newAttendance.save();

    return NextResponse.json(
      { message: "Attendance saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}