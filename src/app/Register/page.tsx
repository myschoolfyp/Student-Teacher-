"use client";
import { useState } from "react";
import { Camera, User } from "lucide-react"; // Using the updated empty profile icon
const departments = [
  'Arts', 'Maths', 'Chem', 'Physics', 
  'English', 'Urdu', 'Islamiat', 'History'
];
export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [userType, setUserType] = useState("");
  const [classLevel, setClassLevel] = useState("");
const [classType, setClassType] = useState("");
const [department, setDepartment] = useState("");
const [cnic, setCnic] = useState("");
const [rollNo, setRollNo] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {

    const nameRegex = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/;
  
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    setError("Names must contain only letters and be 1-20 characters long");
    return false;
  }

  if (firstName.length > 20 || lastName.length > 20) {
    setError("Names cannot exceed 20 characters");
    return false;
  }
    if (firstName.length < 2 || lastName.length < 2) {
      setError("First and Last name must be at least 2 characters long.");
      return false;
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (!/^\d{11}$/.test(contactNumber)) {
      setError("Contact number must be 11 digits.");
      return false;
    }
    if (userType === "Teacher" && !department) {
      setError("Please select a department");
      return false;
    }
    if (userType === "Teacher" && !/^\d{13}$/.test(cnic)) {
      setError("CNIC must be 13 digits");
      return false;
    }
    
    if (userType === "Student" && !/^\d{9}$/.test(rollNo)) {
      setError("Roll number must be 9 digits");
      return false;
    }

    if ((userType === "Admin" || userType === "Teacher" || userType === "Parent") && !/^\d{13}$/.test(cnic)) {
      setError("CNIC must be 13 digits");
      return false;
    }
    

    return true;
  };

 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      const formData = {
        firstName,
        lastName,
        email,
        password,
        userType,
        contactNumber,
        department: userType === "Teacher" ? department : undefined,
        classLevel: userType === "Student" ? classLevel : undefined,
        classType: userType === "Student" ? classType : undefined,
        rollNo: userType === "Student" ? rollNo : undefined,
       
        cnic: userType === "Admin" || userType === "Teacher" || userType === "Parent" ? cnic.replace(/-/g, '') : undefined,
        profilePicture,
      };
  
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register user.");
      }
  
      alert("Registration successful!");
  
      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserType("");
      setContactNumber("");
      setClassLevel("");
      setClassType("");
      setDepartment("");
      setProfilePicture(null);
      setProfilePicturePreview(null);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        setError(error.message || "An error occurred during registration.");
      } else {
        setError("An unknown error occurred during registration.");
      }
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#0F6466] w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-[#0F6466] mb-5">Register</h2>
  
        {/* Profile Picture Upload */}
        <div className="flex justify-center items-center mb-5">
          <label htmlFor="profilePicture" className="cursor-pointer relative">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profile Preview"
                className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-300">
              <Camera size={16} className="text-gray-600" />
            </div>
          </label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
        </div>
  
        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First and Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(/[^A-Za-z' -]/g, ''))}
              pattern="^[A-Za-z]+(?:[' -][A-Za-z]+)*$"
              maxLength={20}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(/[^A-Za-z' -]/g, ''))}
              pattern="^[A-Za-z]+(?:[' -][A-Za-z]+)*$"
              maxLength={20}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
          </div>
  
          {/* Email and Contact in same row */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
            <input
              type="text"
              id="contactNumber"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
          </div>
  
          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            />
          </div>
  
          {/* User Type and Roll Number (for students) */}
          <div className="grid grid-cols-2 gap-3">
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
            >
              <option value="" disabled>Select User Type</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
              <option value="Parent">Parent</option>
              <option value="Student">Student</option>
            </select>
            {userType === "Student" && (
              <input
                type="text"
                id="rollNo"
                placeholder="Roll Number (9 digits)"
                value={rollNo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setRollNo(value);
                }}
                required
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
              />
            )}
          </div>
  
          {/* Student-specific fields */}
          {userType === "Student" && (
            <div className="grid grid-cols-2 gap-3">
              {/* Class Level Dropdown */}
              <select
  id="classLevel"
  value={classLevel}
  onChange={(e) => setClassLevel(e.target.value)}
  required
  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
>
  <option value="" disabled>Select Class</option>
  {[...Array(10)].map((_, i) => (
    <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
  ))}
</select>
  
              {/* Class Type Dropdown */}
              <select
                id="classType"
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base"
              >
                <option value="" disabled>Select Stream</option>
                {[9, 10].includes(Number(classLevel)) ? (
                  <>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Computer">Computer</option>
                  </>
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
          )}
  
          {/* CNIC Field for Admin, Teacher, and Parent */}
          {(userType === "Admin" || userType === "Teacher" || userType === "Parent") && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                CNIC (Without dashes)
              </label>
              <input
                type="text"
                placeholder="3420112345678"
                value={cnic}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                  setCnic(value);
                }}
                required
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base mt-1"
              />
            </div>
          )}
  
          {/* Teacher-specific fields */}
          {userType === "Teacher" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Department Dropdown */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-base mt-1"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
  
          <button
            type="submit"
            className="w-full py-2 bg-[#0F6466] text-white rounded-md shadow hover:bg-[#2C3532] transition-colors duration-200 text-base font-semibold"
          >
            Register
          </button>
  
          <div className="text-center mt-3 text-base">
            Already have an account?{" "}
            <a href="Login#" className="text-[#0F6466]">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}