import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function POST(request: Request) {
  try {
    const { cnic, rollNo, password, userType } = await request.json();

    // Validate required fields
    if (!password || !userType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate identifier based on user type
    if (userType !== "Student" && !cnic) {
      return NextResponse.json(
        { message: "CNIC is required" },
        { status: 400 }
      );
    }
    if (userType === "Student" && !rollNo) {
      return NextResponse.json(
        { message: "Roll number is required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    let user;

    switch (userType) {
      case "Admin":
        user = await db.collection("admins").findOne({ cnic });
        break;
      case "Teacher":
        user = await db.collection("teachers").findOne({ cnic });
        break;
      case "Parent":
        user = await db.collection("parents").findOne({ cnic });
        break;
      case "Student":
        user = await db.collection("students").findOne({ rollNo });
        break;
      default:
        return NextResponse.json({ message: "Invalid userType" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    // Return user data with appropriate identifier
    return userType === "Student"
      ? NextResponse.json(
          {
            message: "Login successful",
            rollNo: user.rollNo,
            userType,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
          },
          { status: 200 }
        )
      : NextResponse.json(
          {
            message: "Login successful",
            cnic: user.cnic,
            userType,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
          },
          { status: 200 }
        );
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}