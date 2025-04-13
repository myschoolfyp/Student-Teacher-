"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Parent = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

export default function Parents() {
  const router = useRouter();
  const [parentsData, setParentsData] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newParent, setNewParent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await fetch("/api/Component/Parents");
      const data = await response.json();
      setParentsData(data);
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    }
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/Component/Parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParent),
      });
      if (response.ok) {
        await fetchParents();
        setIsFormVisible(false);
        setNewParent({
          firstName: "",
          lastName: "",
          email: "",
          contactNumber: "",
        });
      }
    } catch (err) {
      console.error("Error adding parent:", err);
    }
  };

  const handleDeleteParent = async (id: string) => {
    try {
      const response = await fetch(`/api/Component/Parents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        await fetchParents();
      }
    } catch (err) {
      console.error("Error deleting parent:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0F6466]">Parents Management</h1>
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
          placeholder="Search parents..."
          className="border p-3 rounded-lg w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-[#0F6466] text-white px-6 py-3 rounded-lg hover:bg-[#0D4B4C]"
          onClick={() => setIsFormVisible(true)}
        >
          Add Parent
        </button>
      </div>

      <table className="w-full border-collapse shadow-lg">
        <thead className="bg-[#0F6466] text-white">
          <tr>
            <th className="p-4">First Name</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {parentsData
            .filter((parent) =>
              parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              parent.lastName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((parent) => (
              <tr key={parent._id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center">{parent.firstName}</td>
                <td className="p-4 text-center">{parent.lastName}</td>
                <td className="p-4 text-center">{parent.email}</td>
                <td className="p-4 text-center">{parent.contactNumber}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDeleteParent(parent._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">New Parent</h2>
            <form onSubmit={handleAddParent} className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="w-full p-2 border rounded"
                value={newParent.firstName}
                onChange={(e) =>
                  setNewParent({ ...newParent, firstName: e.target.value })
                }
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="w-full p-2 border rounded"
                value={newParent.lastName}
                onChange={(e) =>
                  setNewParent({ ...newParent, lastName: e.target.value })
                }
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                value={newParent.email}
                onChange={(e) =>
                  setNewParent({ ...newParent, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                className="w-full p-2 border rounded"
                value={newParent.contactNumber}
                onChange={(e) =>
                  setNewParent({ ...newParent, contactNumber: e.target.value })
                }
                required
              />
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setIsFormVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0F6466] text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}