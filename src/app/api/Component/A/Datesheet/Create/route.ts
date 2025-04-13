// app/api/Component/A/Datesheet/Create/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Datesheet Schema
const datesheetSchema = new mongoose.Schema({
  datesheetName: String,
  className: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  classLevel: String,
  schedule: [{
    course: String,
    date: Date,
    time: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const DatesheetModel = mongoose.models.Datesheet || mongoose.model("Datesheet", datesheetSchema);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "fetchClasses") {
      const classes = await mongoose.models.Class.find({})
        .select("_id className classLevel courses")
        .lean();
      return NextResponse.json(classes);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { datesheetName, className, classId, classLevel, schedule } = await request.json();

    if (!datesheetName || !className || !classId || !schedule) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const processedSchedule = schedule.map((exam: any) => ({
      ...exam,
      date: new Date(exam.date)
    }));

    const newDatesheet = new DatesheetModel({
      datesheetName,
      className,
      classId,
      classLevel,
      schedule: processedSchedule
    });

    await newDatesheet.save();

    return NextResponse.json({ 
      success: true, 
      message: "Datesheet created successfully",
      id: newDatesheet._id 
    });

  } catch (error) {
    console.error("Error creating datesheet:", error);
    return NextResponse.json(
      { error: "Failed to create datesheet" },
      { status: 500 }
    );
  }
}