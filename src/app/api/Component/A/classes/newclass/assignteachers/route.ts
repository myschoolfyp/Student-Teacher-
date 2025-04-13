import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClassModel from "@/models/Class";
import TeacherModel from "@/models/Teacher";
interface TeacherAssignment {
  course: string;
  teacher: string;
  classId?: string;
}
interface AssignmentPayload {
  course: string;
  teacherId: string;
  classId: string;
}
// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const department = searchParams.get("department");

    if (action === "fetchClasses") {
      const classes = await ClassModel.find({}, { students: 0 })
        .select('_id classLevel className stream courses teachers')
        .lean()
        .exec();
    
      // Add proper typing to the map operation
      const enhancedClasses = classes.map(cls => ({
        ...cls,
        teachers: cls.teachers?.map((teacher: TeacherAssignment) => ({
          ...teacher,
          classId: cls._id // Explicitly add classId to each teacher assignment
        }))
      }));
    
      return NextResponse.json(enhancedClasses);
    }

    if (action === "fetchTeachers" && department) {
      const teachers = await TeacherModel.find({ department })
        .select("_id firstName lastName department cnic assignments")
        .exec();
      return NextResponse.json(teachers);
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { className, classId, teachers } = await request.json() as
{
  className: string;
  classId: string;
  teachers: AssignmentPayload[];
};
    // Validate input
    if (!className || !classId || !teachers || !Array.isArray(teachers)) {
      return NextResponse.json(
        { error: "Invalid input data - missing required fields" },
        { status: 400 }
      );
    }

    // Validate class ID format
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Find and update class by ID
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      { $set: { teachers } },
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json(
        { error: "Class not found with the provided ID" },
        { status: 404 }
      );
    }

    // Update teacher documents
    const updateResults = await Promise.all(
      teachers.map(async (teacherData) => {
        try {
          // Validate teacher ID format
          if (!mongoose.Types.ObjectId.isValid(teacherData.teacherId)) {
            console.error(`Invalid Teacher ID format: ${teacherData.teacherId}`);
            return { success: false, teacherId: teacherData.teacherId };
          }

          const teacherObjectId = new mongoose.Types.ObjectId(teacherData.teacherId);

          // Verify teacher exists
          const teacherExists = await TeacherModel.exists({ _id: teacherObjectId });
          if (!teacherExists) {
            console.error(`Teacher document not found: ${teacherData.teacherId}`);
            return { success: false, teacherId: teacherData.teacherId };
          }

          // Update teacher assignments
          const updatedTeacher = await TeacherModel.findByIdAndUpdate(
            teacherObjectId,
            {
              $addToSet: {
                assignments: {
                  class: updatedClass.className,
                  classId: classDoc._id,
                  course: teacherData.course
                }
              }
            },
            { new: true }
          );

          return { 
            success: true, 
            teacherId: teacherData.teacherId,
            classId: updatedClass._id 
          };
        } catch (error) {
          console.error(`Error updating teacher ${teacherData.teacherId}:`, error);
          return { 
            success: false, 
            teacherId: teacherData.teacherId,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      })
    );

    // Check for failed updates
    const failedUpdates = updateResults.filter(result => !result.success);
    if (failedUpdates.length > 0) {
      console.error('Failed teacher updates:', failedUpdates);
      return NextResponse.json({
        success: false,
        message: "Some teacher assignments failed",
        updatedClass,
        failedUpdates,
        successfulUpdates: updateResults.filter(result => result.success)
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({
      success: true,
      message: "All teachers assigned successfully!",
      updatedClass,
      updatedTeachers: updateResults
    });

  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}