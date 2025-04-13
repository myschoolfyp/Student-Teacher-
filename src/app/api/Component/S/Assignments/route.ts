// app/api/Component/S/Assignments/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");
    const course = searchParams.get("course");

    if (!className || !course) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const assignments = await AssignmentModel.find({ className, course })
      .select("-file.data")
      .lean();

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
