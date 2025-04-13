import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  week: { type: Number, required: true },
  slotNumber: { type: Number, required: true, min: 1, max: 10 },
  startTime: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format (HH:MM)'
    }
  },
  endTime: { 
    type: String, 
    required: true,
    validate: {
      validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format (HH:MM)'
    }
  },
  className: { type: String, required: true },
  course: { type: String, required: true },
  room: { type: String, required: true },
  teacherId: { type: String, required: true },
  students: [
    {
      studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student", 
        required: true 
      },
      rollNo: { type: String, required: true },
      name: { type: String, required: true },
      status: { 
        type: String, 
        enum: ["P", "A", "L"], 
        default: "P" 
      },
    },
  ],
}, { 
  timestamps: true,
  toJSON: { virtuals: true }  // Ensure virtuals are included when converted to JSON
});

// Index to prevent duplicate attendance entries
attendanceSchema.index({ date: 1, className: 1, slotNumber: 1 }, { unique: true });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const AttendanceModel =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default AttendanceModel;