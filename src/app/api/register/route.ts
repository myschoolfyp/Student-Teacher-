import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";
import Teacher from "@/models/Teacher";
import Parent from "@/models/Parent";
import Student from "@/models/Student";

type UserModels = {
  Admin: typeof Admin;
  Teacher: typeof Teacher;
  Parent: typeof Parent;
  Student: typeof Student;
};

export async function POST(req: Request) {
  console.log("🔹 Received a POST request to /api/register");

  try {
    await dbConnect();
    console.log("✅ MongoDB connected successfully");

    const body = await req.json();
    console.log("🔹 Raw request body:", body);

    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      contactNumber,
      classLevel,
      department,
      classType,
      profilePicture,
      cnic,
      rollNo,
    } = body;

    console.log("🔹 Parsed registration data:", {
      firstName,
      lastName,
      email,
      password: "[HIDDEN]",
      userType,
      contactNumber,
      department,
      cnic: userType === "Admin" || userType === "Teacher" || userType === "Parent" ? cnic : "N/A",
      profilePicture: profilePicture ? "[BASE64 IMAGE RECEIVED]" : "❌ No Image",
      rollNo: userType === "Student" ? rollNo : "N/A",
    });

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !userType ||
      !contactNumber ||
      (userType === "Student" && (!classLevel || !classType || !rollNo)) ||
      (userType === "Teacher" && (!department || !cnic)) ||
      (userType === "Admin" && !cnic) ||
      (userType === "Parent" && !cnic) // Add CNIC check for parents
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            userType === "Teacher" && !department
              ? "Department is required for teachers"
              : userType === "Admin" && !cnic
              ? "CNIC is required for admins"
              : userType === "Parent" && !cnic
              ? "CNIC is required for parents"
              : userType === "Student" && (!classLevel || !classType || !rollNo)
              ? "Class level, class type, and roll number are required for students"
              : "All fields are required",
        },
        { status: 400 }
      );
    }

    // CNIC Validation for Admin, Teacher, and Parent
    if (userType === "Admin" || userType === "Teacher" || userType === "Parent") {
      const cleanCNIC = cnic?.replace(/-/g, "") || "";

      // Validate CNIC format (must be 13 digits)
      if (!/^\d{13}$/.test(cleanCNIC)) {
        return NextResponse.json(
          { success: false, message: "Invalid CNIC format. Must be 13 digits" },
          { status: 400 }
        );
      }

      // Check for duplicate CNIC (for Teachers)
      if (userType === "Teacher") {
        const existingTeacher = await Teacher.findOne({ cnic: cleanCNIC });
        if (existingTeacher) {
          console.error("❌ CNIC already exists:", cleanCNIC);
          return NextResponse.json(
            { success: false, message: "CNIC already registered" },
            { status: 400 }
          );
        }
      }

      // Check for duplicate CNIC (for Admins)
      if (userType === "Admin") {
        const existingAdmin = await Admin.findOne({ cnic: cleanCNIC });
        if (existingAdmin) {
          console.error("❌ CNIC already exists:", cleanCNIC);
          return NextResponse.json(
            { success: false, message: "CNIC already registered" },
            { status: 400 }
          );
        }
      }

      // Check for duplicate CNIC (for Parents)
      if (userType === "Parent") {
        const existingParent = await Parent.findOne({ cnic: cleanCNIC });
        if (existingParent) {
          console.error("❌ CNIC already exists:", cleanCNIC);
          return NextResponse.json(
            { success: false, message: "CNIC already registered" },
            { status: 400 }
          );
        }
      }
    }

    // Determine the correct user model based on userType
    const userModels: UserModels = {
      Admin,
      Teacher,
      Parent,
      Student,
    };

    const UserModel = userModels[userType as keyof UserModels];

    // Check if the email is already registered
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.error("❌ User already exists with email:", email);
      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      ...(userType === "Student" && {
        classLevel,
        classType,
        rollNo,
      }),
      ...(userType === "Teacher" && {
        department,
        cnic: cnic.replace(/-/g, ''), // Ensure CNIC is assigned for Teachers
      }),
      ...(userType === "Admin" && {
        cnic: cnic.replace(/-/g, ''), // Ensure CNIC is assigned for Admins
      }),
      ...(userType === "Parent" && {
        cnic: cnic.replace(/-/g, ''), // Ensure CNIC is assigned for Parents
      }),
      profilePicture,
    });

    // Save the new user to the database
    await newUser.save();
    console.log("✅ User registered successfully:", newUser);

    return NextResponse.json(
      { success: true, message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Server error during registration:", error.message || error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}