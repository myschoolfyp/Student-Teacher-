"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Student = {
  _id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  classLevel: number;
  classType: string;
};

export default function Students() {
  const router = useRouter();
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassLevel, setSelectedClassLevel] = useState("all");
  const [selectedClassType, setSelectedClassType] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/Component/A/Students");
      const data = await response.json();
      setStudentsData(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const classTypeOptions = (level: string) => {
    if (level === "all" || parseInt(level) <= 7) return ["General"];
    return ["All", "Science", "Arts", "Computer"];
  };

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

    const levelMatch = selectedClassLevel === "all" || 
      student.classLevel === parseInt(selectedClassLevel);

    let typeMatch = true;
    if (selectedClassType !== "all") {
      if (parseInt(selectedClassLevel) <= 7) {
        typeMatch = student.classType === "00";
      } else {
        const typeCode = selectedClassType === "Science" ? "11" :
          selectedClassType === "Arts" ? "22" : "33";
        typeMatch = student.classType === typeCode;
      }
    }

    return matchesSearch && levelMatch && typeMatch;
  });

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const toggleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => prev.includes(studentId)
      ? prev.filter(id => id !== studentId)
      : [...prev, studentId]);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0F6466]">Students Management</h1>
        <button
          className="bg-[#0F6466] text-white px-6 py-3 rounded-lg hover:bg-[#0D4B4C]"
          onClick={() => router.back()}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search students..."
          className="border p-3 rounded-lg w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-3 rounded-lg w-64"
          value={selectedClassLevel}
          onChange={(e) => {
            setSelectedClassLevel(e.target.value);
            setSelectedClassType("all");
          }}
        >
          <option value="all">All Class Levels</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
            <option key={level} value={level}>Class {level}</option>
          ))}
        </select>
        
        <select
          className="border p-3 rounded-lg w-64"
          value={selectedClassType}
          onChange={(e) => setSelectedClassType(e.target.value)}
          disabled={selectedClassLevel !== "all" && parseInt(selectedClassLevel) <= 7}
        >
          <option value="all">All Class Types</option>
          {classTypeOptions(selectedClassLevel).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse shadow-lg">
        <thead className="bg-[#0F6466] text-white">
          <tr>
            <th className="p-4">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              />
            </th>
            <th className="p-4">#</th>
            <th className="p-4">Roll No</th>
            <th className="p-4">First Name</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Class Level</th>
            <th className="p-4">Class Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={student._id} className="border-b hover:bg-gray-50">
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => toggleStudentSelect(student._id)}
                />
              </td>
              <td className="p-4 text-center">{index + 1}</td>
              <td className="p-4 text-center font-semibold">{student.rollNo}</td>
              <td className="p-4 text-center">{student.firstName}</td>
              <td className="p-4 text-center">{student.lastName}</td>
              <td className="p-4 text-center">{student.email}</td>
              <td className="p-4 text-center">{student.contactNumber}</td>
              <td className="p-4 text-center">{student.classLevel}</td>
              <td className="p-4 text-center">
                {student.classLevel <= 7 ? "General" : 
                 student.classType === "11" ? "Science" :
                 student.classType === "22" ? "Arts" : "Computer"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}