import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const mongoUri = "mongodb://localhost:27017/myschool";
const client = new MongoClient(mongoUri);

export async function POST(request: Request) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password || !userType) {
      return NextResponse.json(
        { message: "Missing email, password, or userType" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();
    const collectionName = userType === "Admin" ? "admins" : "teachers";
    const user = await db.collection(collectionName).findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    const userCode = userType === "Admin" ? user.adminCode : user.employeeCode;

    return NextResponse.json({
      message: "User authenticated",
      user: {
        id: userCode,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password,
        contactNumber: user.contactNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PUT(request: Request) {
  try {
  
    const body = await request.json();
    console.log("PUT request body:", body);

    const {
      identifier,
      email,
      userType,
      firstName,
      lastName,
      password,
      contactNumber,
      profilePicture,
    } = body;

  
    if (!identifier || !email || !userType||!password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

   
    await client.connect();
    const db = client.db();
    const collectionName = userType === "Admin" ? "admins" : "teachers";

 
    const updatedData: Partial<any> = {
      firstName,
      lastName,
      contactNumber,
      
    };

  
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }
   
    if (profilePicture !== undefined) {
      updatedData.profilePicture = profilePicture;
    }

 
    const result = await db.collection(collectionName).updateOne(
      { [userType === "Admin" ? "adminCode" : "employeeCode"]: identifier },
      { $set: updatedData }
    );

  
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "No matching user found for update" },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 200 }
      );
    }

  
    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
   
    console.error("Error in PUT request:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    
    await client.close();
  }
}

export async function GET(request: Request) {
  try {
   
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userType = searchParams.get("userType");

   
    if (!email || !userType) {
      return NextResponse.json(
        { message: "Missing email or userType query parameters" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();
    const collectionName = userType === "Admin" ? "admins" : "teachers";

    
    const user = await db.collection(collectionName).findOne({ email });

    
    console.log("User found:", user);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

   
    return NextResponse.json({
      profilePicture: user.profilePicture,
    });
  } catch (error) {
  
    console.error("Error in GET:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    
    await client.close();
  }
}


export async function PATCH(request: Request) {
  try {
    const { identifier, userType, profilePicture } = await request.json();

    if (!identifier || !userType || profilePicture === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await client.connect();
    const db = client.db();
    const collectionName = userType === "Admin" ? "admins" : "teachers";

    const result = await db.collection(collectionName).updateOne(
      { [userType === "Admin" ? "adminCode" : "employeeCode"]: identifier },
      { $set: { profilePicture } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes were made" }, { status: 200 });
    }

    return NextResponse.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error in PATCH:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}


export async function DELETE(request: Request) {
  try {
    const { identifier, userType } = await request.json();
    await client.connect();
    const db = client.db();
    const collectionName = userType === "Admin" ? "admins" : "teachers";

    const result = await db.collection(collectionName).updateOne(
      { [userType === "Admin" ? "adminCode" : "employeeCode"]: identifier },
      { $set: { profilePicture: null } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes were made" }, { status: 200 });
    }

    return NextResponse.json({ message: "Profile picture removed successfully" });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
