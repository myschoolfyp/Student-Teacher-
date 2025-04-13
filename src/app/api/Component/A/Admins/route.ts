import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET() {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const admins = await db.collection("admins")
      .find({}, { projection: { profilePicture: 0 } })
      .toArray();
    return NextResponse.json(admins, { status: 200 });
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
        { message: "Admin ID is required", error: true },
        { status: 400 }
      );
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const result = await db.collection("admins")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Admin not found", error: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Admin deleted successfully", error: false },
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