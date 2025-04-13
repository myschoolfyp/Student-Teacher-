"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [cnic, setCnic] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...(category === "Student" ? { rollNo } : { cnic }),
        password,
        userType: category,
      };

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json();
        setError(message || "Error logging in");
        return;
      }

      const { 
        cnic: userCnic, 
        rollNo: userRollNo, 
        userType, 
        firstName, 
        lastName, 
        contactNumber 
      } = await response.json();

      alert("Login successful!");

      // Store identifier based on user type
      if (userType === "Student") {
        localStorage.setItem("rollNo", userRollNo);
      } else {
        localStorage.setItem("cnic", userCnic);
      }
      
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);
      localStorage.setItem("contactNumber", contactNumber);

      router.push(`/Profile?userType=${userType}`);
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-[550px] border-2 border-[#0F6466]">
        <h2 className="text-2xl font-bold text-center text-[#0F6466] mb-4">Welcome Back</h2>
  
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
  
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-base font-medium text-gray-700">Select Your Role</label>
            <select
              id="role"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6466] focus:border-[#0F6466] transition-all duration-200"
            >
              <option value="" disabled>Select Your Role</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
              <option value="Parent">Parent</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {/* Dynamic Identifier Input */}
          {category === "Student" ? (
            <div>
              <label htmlFor="rollNo" className="block text-base font-medium text-gray-700">
                Roll Number (9 digits)
              </label>
              <input
                type="text"
                id="rollNo"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="123456789"
                required
                pattern="\d{9}"
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6466] focus:border-[#0F6466] transition-all duration-200"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="cnic" className="block text-base font-medium text-gray-700">
                CNIC (Without Dashes)
              </label>
              <input
                type="text"
                id="cnic"
                value={cnic}
                onChange={(e) => setCnic(e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="3420112345678"
                required
                pattern="\d{13}"
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6466] focus:border-[#0F6466] transition-all duration-200"
              />
            </div>
          )}

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0F6466] focus:border-[#0F6466] transition-all duration-200"
            />
          </div>
  
          <button
            type="submit"
            className="w-full py-2 bg-[#0F6466] text-white rounded-md shadow hover:bg-[#2C3532] transition-colors duration-200 text-base font-semibold"
          >
            Login
          </button>
  
          <div className="text-center mt-3 text-base">
            Don't have an account?{" "}
            <a href="Register#" className="text-[#0F6466]">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}