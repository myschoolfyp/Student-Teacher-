import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AssignmentModel from "@/models/Assignment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    
    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    const decodedFileName = decodeURIComponent(fileName);
    await mongoose.connect(process.env.MONGODB_URI!);

    // First check assignment files
    let fileData = await AssignmentModel.findOne(
      { "file.fileName": decodedFileName },
      { "file": 1 }
    );

    // If not found, check submissions
    if (!fileData) {
      const submissionData = await AssignmentModel.findOne(
        { "submissions.file.fileName": decodedFileName },
        { "submissions.$": 1 }
      );
      
      if (submissionData?.submissions?.[0]?.file) {
        fileData = { file: submissionData.submissions[0].file };
      }
    }

    if (!fileData?.file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const fileBuffer = Buffer.from(fileData.file.data.$binary.base64, "base64");
    
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": fileData.file.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileData.file.fileName)}"`,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}