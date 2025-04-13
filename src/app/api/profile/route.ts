import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET(request: Request) {
  try {
    const identifier = request.headers.get("identifier");
    const userType = request.headers.get("userType");

    if (!identifier || !userType) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    let collectionName, query;
    switch(userType) {
      case "Admin": 
      case "Teacher":
      case "Parent":
        collectionName = userType.toLowerCase() + "s";
        query = { cnic: identifier };
        break;
      case "Student":
        collectionName = "students";
        query = { rollNo: identifier };
        break;
      default: 
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const user = await db.collection(collectionName).findOne(query);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Common fields
    const responseData = { 
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNumber: user.contactNumber,
      profilePicture: user.profilePicture,
      userType,
    };

    // Add type-specific fields
    if (userType === "Student") {
      Object.assign(responseData, { 
        rollNo: user.rollNo,
        classLevel: user.classLevel, // Add these
        classType: user.classType ,
        className: user.className
      });
    }

    if (userType === "Teacher") {
      Object.assign(responseData, { 
        department: user.department,
        _id: user._id.toString() // Add this line
      });
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}