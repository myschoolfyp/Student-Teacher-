import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function POST(request: Request) {
  let client: MongoClient | null = null;
  try {
    const parent = await request.json();
    const { firstName, lastName, email, contactNumber } = parent;

    if (!firstName || !lastName || !email || !contactNumber) {
      return NextResponse.json(
        { message: "All fields are required", error: true },
        { status: 400 }
      );
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const existingParent = await db.collection("parents").findOne({ email });

    if (existingParent) {
      return NextResponse.json(
        { message: "Parent with this email already exists", error: true },
        { status: 409 }
      );
    }

    const result = await db.collection("parents").insertOne({
      firstName,
      lastName,
      email,
      contactNumber,
    });

    return NextResponse.json(
      { message: "Parent added successfully", error: false },
      { status: 201 }
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

export async function GET() {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const parents = await db.collection("parents").find().toArray();
    return NextResponse.json(parents, { status: 200 });
  } catch (error: any) {
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
        { message: "Parent ID is required", error: true },
        { status: 400 }
      );
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const result = await db.collection("parents").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Parent not found", error: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Parent deleted successfully", error: false },
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