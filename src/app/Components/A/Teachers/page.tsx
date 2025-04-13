"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Teacher = {
  _id: string;
  cnic: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  department: string;
};

export default function Teachers() {
  const router = useRouter();
  const [teachersData, setTeachersData] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/Component/A/Teachers");
      const data = await response.json();
      setTeachersData(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      const response = await fetch(`/api/Component/Teachers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        await fetchTeachers();
      }
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTeachers(teachersData.map(teacher => teacher._id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const toggleSingleSelect = (id: string) => {
    setSelectedTeachers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredTeachers = teachersData.filter(teacher => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.cnic.includes(searchTerm)
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0F6466]">Teachers Management</h1>
        <button
          className="bg-[#0F6466] text-white px-6 py-3 rounded-lg hover:bg-[#0D4B4C]"
          onClick={() => router.back()}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by CNIC or name..."
          className="border p-3 rounded-lg w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse shadow-lg">
        <thead className="bg-[#0F6466] text-white">
          <tr>
            <th className="p-4">
              <input 
                type="checkbox" 
                onChange={toggleSelectAll}
                checked={selectedTeachers.length === teachersData.length && teachersData.length > 0}
              />
            </th>
            <th className="p-4">CNIC</th>
            <th className="p-4">First Name</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">Department</th>
            <th className="p-4">Email</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map((teacher) => (
            <tr key={teacher._id} className="border-b hover:bg-gray-50">
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedTeachers.includes(teacher._id)}
                  onChange={() => toggleSingleSelect(teacher._id)}
                />
              </td>
              <td className="p-4 text-center">{teacher.cnic}</td>
              <td className="p-4 text-center">{teacher.firstName}</td>
              <td className="p-4 text-center">{teacher.lastName}</td>
              <td className="p-4 text-center">{teacher.department}</td>
              <td className="p-4 text-center">{teacher.email}</td>
              <td className="p-4 text-center">{teacher.contactNumber}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleDeleteTeacher(teacher._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}