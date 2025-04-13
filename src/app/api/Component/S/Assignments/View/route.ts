// app/api/Component/S/Assignments/View/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";

interface Submission {
  rollNo: string;
  description: string;
  file?: {
    fileName: string;
    contentType: string;
  };
  obtainedMarks?: number;
  submittedAt: string;
}

interface Assignment {
  _id: string;
  submissions: Submission[];
  [key: string]: any;
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

// Add to your existing route.ts
export async function PUT(request: Request) {
    try {
      await connectDB();
      const formData = await request.formData();
  
      const assignmentId = formData.get("assignmentId");
      const rollNo = formData.get("rollNo");
      
      if (!assignmentId || !rollNo) {
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
  
      const updateData = {
        "submissions.$.submissionText": formData.get("submissionText")?.toString(),
        ...(fileData && { "submissions.$.file": fileData })
      };
  
      const result = await AssignmentModel.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(assignmentId.toString()),
          "submissions.rollNo": rollNo 
        },
        { $set: updateData },
        { new: true }
      );
  
      if (!result) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }
  
      const updatedSubmission = result.submissions.find(
        (sub: any) => sub.rollNo === rollNo
      );
  
      return NextResponse.json({
        success: true,
        submission: updatedSubmission
      });
  
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  // Add to your existing route.ts
export async function GET(request: Request) {
    try {
      await connectDB();
      const { searchParams } = new URL(request.url);
      const assignmentId = searchParams.get("assignmentId");
      const rollNo = searchParams.get("rollNo");
  
      if (!assignmentId || !rollNo) {
        return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400 }
        );
      }
  
      const assignment = await AssignmentModel.findOne({
        _id: new mongoose.Types.ObjectId(assignmentId),
        "submissions.rollNo": rollNo
      }).lean();
  
      if (!assignment) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }
  
      const submission = assignment.submissions.find(
        (sub: any) => sub.rollNo === rollNo
      );
  
      return NextResponse.json({ submission });
  
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }