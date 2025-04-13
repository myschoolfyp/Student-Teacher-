import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";
import { ObjectId } from 'mongodb';
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

function isValidObjectId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const formData = await request.formData();

    // Get required fields
    const assignmentId = formData.get("assignmentId");
    const rollNo = formData.get("rollNo");
    const studentName = formData.get("studentName");

    if (!assignmentId || !rollNo || !studentName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process file upload
    let fileData;
    const submissionFile = formData.get("submissionFile");
    if (submissionFile instanceof Blob) {
      const fileBuffer = Buffer.from(await submissionFile.arrayBuffer());
      fileData = {
        data: fileBuffer,
        contentType: submissionFile.type,
        fileName: submissionFile.name,
      };
    }

    // Create simplified submission
    const submission = {
      rollNo,
      studentName,
      submittedAt: new Date(),
      submissionText: formData.get("submissionText")?.toString(),
      file: fileData || undefined
    };

    // Update database
    await AssignmentModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(assignmentId.toString()),
      { $push: { submissions: submission } }
    );

    return NextResponse.json({
      success: true,
      message: "Submission completed successfully"
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// route.ts - Modify GET function
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className");
    const course = searchParams.get("course");
    const rollNo = searchParams.get("rollNo");

    if (!className || !course) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const assignments = await AssignmentModel.aggregate([
      { $match: { className, course } },
      {
        $addFields: {
          studentSubmission: {
            $filter: {
              input: "$submissions",
              as: "sub",
              cond: { $eq: ["$$sub.rollNo", rollNo] }
            }
          }
        }
      },
      {
        $project: {
          assignmentTopic: 1,
          description: 1,
          deadline: 1,
          totalMarks: 1,
          file: 1,
          teacherFirstName: 1,
          teacherLastName: 1,
          studentSubmission: 1,
          submissions: { $size: "$submissions" }
        }
      }
    ]);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}