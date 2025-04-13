import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  assignmentTopic: { type: String, required: true },
  className: { type: String, required: true },
  course: { type: String, required: true },
  totalMarks: { type: Number, max: 100, min: 0 },
  description: { type: String },
  deadline: { type: Date },
  
  file: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: true 
  },
  teacherFirstName: { type: String, required: true },
  teacherLastName: { type: String, required: true },
  // Assignment.ts - Update submissions schema
submissions: [{
  rollNo: { type: String, required: true },
  studentName: { type: String, required: true },
    file: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String }
  },
  submittedAt: { type: Date, default: Date.now },
  submissionText: String,
  obtainedMarks: { type: Number, default: null }, // Changed from 'grade'
  totalMarks: { type: Number }, // Added
  feedback: String
}]

});

const AssignmentModel = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
export default AssignmentModel;