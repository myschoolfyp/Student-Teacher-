"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  contactNumber: string;
  profilePicture: string | null;
};

export default function EditProfilePage() {
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData | null > (null);
  const [error, setError] = useState("");
  const [isEditPopupVisible, setEditPopupVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null > (null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const handleSubmit = async () => {
    
    if (!userType || !email || !password) 
      {
      setError("All fields are required.");
      return;
       }

    try {
      const response = await fetch("/api/editprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }
      setUserData(data.user as UserData);
      setEditPopupVisible(true);
      setError("");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  

const handleUpdate = async () => {
  if (isLoading) return; 

  if (!userData || !userType || !email || !userData.firstName || !userData.lastName || !userData.password || !userData.contactNumber) {
    setError("Please fill all fields before submitting.");
    return;
  }

  setIsLoading(true); 

  try {
    const response = await fetch("/api/editprofile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: userData.id,
        email: userData.email,
        userType,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        contactNumber: userData.contactNumber,
        profilePicture, 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to update user details.");
      return;
    }

    if (data.message === "No changes were made") {
      setError("No updates detected.");
    } else {
      setEditPopupVisible(false);
      setSuccess(true); 
      setError("");
    }
  } catch (err) {
    console.error("Error in handleUpdate:", err);
    setError("An error occurred while updating data.");
  } finally {
    setIsLoading(false); 
  }
};


  
  const isFieldEmpty = (field: string) => !field.trim();

  
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userData) return;
      try {
        const response = await fetch(
          `/api/editprofile?email=${encodeURIComponent(
            userData.email
          )}&userType=${encodeURIComponent(userType)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
  
        const data = await response.json();
  
        if (response.ok) {
          setProfilePicture(data.profilePicture);
          setUserData((prev) =>
            prev ? { ...prev, profilePicture: data.profilePicture } : null
          );
        } else {
          console.error("GET error:", data.message);
          setError(data.message || "Failed to fetch profile picture.");
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        setError("An error occurred while fetching the profile picture.");
      }
    };
  
    fetchProfilePicture();
  }, [userData, userType]);
  
  

  
  const handleOpenFileManager = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      await updateProfilePicture(base64data);
    };
  };

  
  const updateProfilePicture = async (newPicture: string) => {
    try {
      const response = await fetch("/api/editprofile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: userData?.id,
          userType,
          profilePicture: newPicture,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        
        setProfilePicture(newPicture);
        setUserData((prev) =>
          prev ? { ...prev, profilePicture: newPicture } : null
        );
      } else {
        setError(data.message || "Failed to update profile picture.");
      }
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError("An error occurred while updating profile picture.");
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      const response = await fetch("/api/editprofile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: userData?.id,
          userType,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfilePicture(null);
        setUserData((prev) =>
          prev ? { ...prev, profilePicture: null } : null
        );
      } else {
        setError(data.message || "Failed to remove profile picture.");
      }
    } catch (err) {
      console.error("Error removing profile picture:", err);
      setError("An error occurred while removing profile picture.");
    }
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#e0f2f1]">
   
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl w-full">
        <h1 className="text-3xl font-bold text-[#00695c] text-center mb-8">
          Confirm Your Identity
        </h1>
        {error && (
          <p className="text-red-500 text-center bg-red-50 border border-red-400 p-2 rounded-lg mb-4">
            {error}
          </p>
        )}
       
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Select Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(userType) && error ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select --</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Enter Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(email) && error ? "border-red-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2 text-[#004d40]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40] ${
                isFieldEmpty(password) && error ? "border-red-500" : ""
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
            onClick={() => router.push("/Login")}
          >
            Cancel
          </button>
          <button
            className="bg-[#004d40] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#00332e] transition duration-200 shadow-md"
            onClick={handleSubmit}
          >
            Edit
          </button>
        </div>
      </div>

      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

     
      {isEditPopupVisible && userData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-center text-[#00695c] mb-6">
              Edit User Details
            </h2>
           

            {profilePicture ? (
              <div className="mb-6 flex flex-col items-center">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex space-x-1 mt-2">
                  <button
                    className="bg-[#004d40] text-white text-xs font-semibold py-1 px-2 rounded"
                    onClick={handleOpenFileManager}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white text-xs font-semibold py-1 px-2 rounded"
                    onClick={handleProfilePictureRemove}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                  No Image
                </div>
                <div className="flex space-x-1 mt-2">
                  <button
                    className="bg-[#004d40] text-white text-xs font-semibold py-1 px-2 rounded"
                    onClick={handleOpenFileManager}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  {userType === "Admin" ? "Admin Code" : "Employee ID"}
                </label>

                <p className="border p-3 rounded-lg bg-gray-100 text-gray-700">
                  {userData?.id || "Not Available"}
                </p>

              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Email
                </label>

                <p className="border p-3 rounded-lg bg-gray-100 text-gray-700">
                  {userData.email}
                </p>
                
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  First Name
                </label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) =>
                    setUserData({ ...userData, firstName: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) =>
                    setUserData({ ...userData, lastName: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-[#004d40] font-semibold"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-[#004d40]">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={userData.contactNumber}
                  onChange={(e) =>
                    setUserData({ ...userData, contactNumber: e.target.value })
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-[#004d40] focus:border-[#004d40]"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
                onClick={() => setEditPopupVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#004d40] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#00332e] transition duration-200 shadow-md"
                onClick={() => {
                  if (confirm("Are you sure you want to make changes?"))
                    handleUpdate();
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
             
            </h2>
            <p className="text-gray-700 mb-6">
            
            </p>
            <button
              className="bg-[#004d40] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#00332e] transition duration-200"
              onClick={() => router.push("/Login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
