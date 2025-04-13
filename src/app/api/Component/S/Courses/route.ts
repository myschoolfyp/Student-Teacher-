import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClassModel from "@/models/Class";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

// Add interface for class document
interface ClassDocument extends mongoose.Document {
  classLevel: string;
  className: string;
  stream: string;
  students: any[];
  courses: string[];
  teachers: any[];
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");

    const classNumberMap: {[key: string]: string} = {
      "Grade 2 General": "TWO",
      // Add other mappings as needed
    };

    const dbClassName = classNumberMap[className || ""] || className;

    if (!dbClassName) {
      return NextResponse.json(
        { error: "className parameter is required" },
        { status: 400 }
      );
    }

    // Add proper typing to the query
    const classDoc = await ClassModel.findOne({ className: dbClassName })
      .select("courses")
      .lean<ClassDocument>();

    if (!classDoc) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Now TypeScript knows about courses property
    return NextResponse.json({ courses: classDoc.courses });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}