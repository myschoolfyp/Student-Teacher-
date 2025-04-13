import { NextResponse } from "next/server";
import mongoose, { Document } from "mongoose";
import TimetableModel from "@/models/Timetable";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

// Define interface for timetable document
interface TimetableDocument extends Document {
  className: string;
  days: {
    name: string;
    slots: {
      startTime: string;
      endTime: string;
      course: string;
      teacher: string;
      room: string;
    }[];
  }[];
  breakTime: {
    start: string;
    end: string;
  };
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");
    
    const classNumberMap: {[key: string]: string} = {
      "Grade 2 General": "TWO",
    };
    
    const dbClassName = classNumberMap[className || ""] || className;

    if (!dbClassName) {
      return NextResponse.json(
        { error: "className parameter is required" },
        { status: 400 }
      );
    }

    // Add type assertion for the query result
    const timetable = await TimetableModel.findOne({ className })
    .select("days breakTime")
    .lean() as (TimetableDocument & { _id: any }) | null;

    if (!timetable) {
      return NextResponse.json(
        { error: "Timetable not found for this class" },
        { status: 404 }
      );
    }

    // Now TypeScript knows about days and breakTime
    const transformedData = {
      days: timetable.days.map((day) => ({
        day: day.name,
        periods: day.slots.map((slot) => ({
          time: `${slot.startTime} - ${slot.endTime}`,
          subject: slot.course,
          teacher: slot.teacher,
          room: slot.room
        }))
      })),
      breakTime: timetable.breakTime
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}