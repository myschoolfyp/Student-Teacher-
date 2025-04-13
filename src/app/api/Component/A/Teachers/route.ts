import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET() {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    
    // Correct projection to include all fields except excluded ones
    const teachers = await db.collection("teachers").find({}, {
      projection: {
        password: 0,
        profilePicture: 0
      }
    }).toArray();

    // Convert MongoDB ObjectId to string
    const serializedTeachers = teachers.map(teacher => ({
      ...teacher,
      _id: teacher._id.toString()
    }));

    return NextResponse.json(serializedTeachers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { message: "Internal server error", error: true },
      { status: 500 }
    );
  } finally {
    client?.close();
  }
}

export async function DELETE(request: Request) {
  let client: MongoClient | null = null;
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "Teacher ID is required", error: true },
        { status: 400 }
      );
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const result = await db.collection("teachers").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Teacher not found", error: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Teacher deleted successfully", error: false },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { message: "Internal server error", error: true },
      { status: 500 }
    );
  } finally {
    client?.close();
  }
}