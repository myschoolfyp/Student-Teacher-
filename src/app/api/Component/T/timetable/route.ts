// src/app/api/teacher/timetable/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import TimetableModel from "@/models/Timetable";

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
    const teacherId = searchParams.get("teacherId");
    
    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const allTimetables = await TimetableModel.find({});
    const teacherSlots: Array<Slot> = [];

    allTimetables.forEach((timetable) => {
      timetable.days.forEach((day: any) => {
        day.slots.forEach((slot: any) => {
          if (slot.teacherId === teacherId) {
            teacherSlots.push({
              day: day.name,
              startTime: slot.startTime,
              endTime: slot.endTime,
              course: slot.course,
              room: slot.room,
              className: timetable.className
            });
          }
        });
      });
    });

    return NextResponse.json(teacherSlots);
  } catch (error) {
    console.error("Error fetching teacher timetable:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

interface Slot {
  day: string;
  startTime: string;
  endTime: string;
  course: string;
  room: string;
  className: string;
}