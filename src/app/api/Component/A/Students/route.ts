import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET() {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const students = await db.collection("students").find().toArray();
    return NextResponse.json(students, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: true },
      { status: 500 }
    );
  } finally {
    client?.close();
  }
}

export async function PUT(request: Request) {
  let client: MongoClient | null = null;
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Student ID is required", error: true },
        { status: 400 }
      );
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const updateResult = await db.collection("students").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: "Student not found", error: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Student updated successfully", error: false },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: true },
      { status: 500 }
    );
  } finally {
    client?.close();
  }
}