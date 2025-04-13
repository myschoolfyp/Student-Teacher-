import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import mongoose from 'mongoose';

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET(request: Request) {
  const client = new MongoClient(mongoUri);
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("classLevel"); // Now gets full text (e.g. "Class 2")
    const stream = searchParams.get("stream");

    // Validate class level text format (e.g. "Class 2")
    if (!classLevel || !/^Class [1-9]|10$/.test(classLevel)) {
      return NextResponse.json(
        { message: "Valid class level parameter required (e.g. 'Class 2')" },
        { status: 400 }
      );
    }

    const isUpperClass = ["Class 9", "Class 10"].includes(classLevel);
    let classType = "General";

    if (isUpperClass) {
      if (!stream || !["Arts", "Science", "Computer"].includes(stream)) {
        return NextResponse.json(
          { message: "Valid stream required for classes 9-10" },
          { status: 400 }
        );
      }
      classType = stream;
    }

    await client.connect();
    const db = client.db();

    const query = { 
      classLevel, // Now using the full text
      classType
    };

    const students = await db.collection("students")
      .find(query)
      .project({ password: 0 }) 
      .toArray();
    if (!Array.isArray(students)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(students);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", message);
    return NextResponse.json(
      { message: "Server error: " + message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  const client = new MongoClient(mongoUri);
  try {
    const { classLevel, className, stream, students } = await request.json();

    // Validate required fields
    if (!classLevel || !className) {
      return NextResponse.json(
        { message: "Class level and name are required" },
        { status: 400 }
      );
    }

    // Validate students format
    if (!Array.isArray(students) || students.some(rollNo => typeof rollNo !== 'string')) {
      return NextResponse.json(
        { message: "Invalid students format" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db();

    // Get complete student documents instead of just counting
    const studentDocs = await db.collection('students').find({
      rollNo: { $in: students }
    }).toArray();

    // Verify all students exist
    if (studentDocs.length !== students.length) {
      const missingStudents = students.filter(rollNo => 
        !studentDocs.some(s => s.rollNo === rollNo)
      );
      return NextResponse.json(
        { 
          message: "One or more students don't exist",
          missingStudents 
        },
        { status: 400 }
      );
    }

    // Prepare student data for class document
    const classStudents = studentDocs.map(student => ({
      _id: student._id,
      rollNo: student.rollNo,
      name: `${student.firstName} ${student.lastName}`
    }));

    // Create class document
    const newClass = {
      classLevel,
      className,
      stream: ["Class 9", "Class 10"].includes(classLevel) ? stream : "General",
      students: classStudents,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check for existing class
    const existingClass = await db.collection('classes').findOne({ className });
    if (existingClass) {
      return NextResponse.json(
        { message: "Class name already exists" },
        { status: 400 }
      );
    }

    // Insert new class
    const result = await db.collection('classes').insertOne(newClass);

    // Update students with their new class
    if (result.insertedId && classStudents.length > 0) {
      try {
        const updateResult = await db.collection('students').updateMany(
          { 
            _id: { $in: classStudents.map(s => s._id) } 
          },
          { $set: { className: className } }
        );

        if (updateResult.modifiedCount !== classStudents.length) {
          console.warn(`Some students weren't updated. Expected ${classStudents.length}, updated ${updateResult.modifiedCount}`);
        }
      } catch (updateError) {
        console.error("Failed to update students:", updateError);
        // Rollback class creation if you want to maintain consistency
        await db.collection('classes').deleteOne({ _id: result.insertedId });
        return NextResponse.json(
          { message: "Failed to update student records" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Class created successfully",
      classId: result.insertedId,
      className: className,
      students: classStudents.map(s => ({
        id: s._id,
        rollNo: s.rollNo,
        name: s.name
      }))
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Class creation error:", message);
    return NextResponse.json(
      { message: "Server error: " + message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}