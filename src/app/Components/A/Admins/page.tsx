"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  _id: string;
  cnic: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

export default function Admins() {
  const router = useRouter();
  const [adminsData, setAdminsData] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/Component/A/Admins");
      const data = await response.json();
      setAdminsData(data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/Component/Admins`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        await fetchAdmins();
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAdmins(adminsData.map(admin => admin._id));
    } else {
      setSelectedAdmins([]);
    }
  };

  const toggleSingleSelect = (id: string) => {
    setSelectedAdmins(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAdmins = adminsData.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.firstName.toLowerCase().includes(searchLower) ||
      admin.lastName.toLowerCase().includes(searchLower) ||
      admin.cnic.includes(searchTerm)
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0F6466]">Admins Management</h1>
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
                checked={selectedAdmins.length === adminsData.length && adminsData.length > 0}
              />
            </th>
            <th className="p-4">CNIC</th>
            <th className="p-4">First Name</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map((admin) => (
            <tr key={admin._id} className="border-b hover:bg-gray-50">
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedAdmins.includes(admin._id)}
                  onChange={() => toggleSingleSelect(admin._id)}
                />
              </td>
              <td className="p-4 text-center">{admin.cnic}</td>
              <td className="p-4 text-center">{admin.firstName}</td>
              <td className="p-4 text-center">{admin.lastName}</td>
              <td className="p-4 text-center">{admin.email}</td>
              <td className="p-4 text-center">{admin.contactNumber}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleDeleteAdmin(admin._id)}
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