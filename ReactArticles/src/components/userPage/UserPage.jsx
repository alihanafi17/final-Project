import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

function UserPage() {
  const { user } = useAuth();

  const [Name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const navigate = useNavigate();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8801/users/${user.email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: Name 
            ,address: address,
            phone: phone
          }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        alert("User not found");
      } else if (response.ok) {
        alert("User updated successfully!");
        navigate(`/userPage/${user.email}`);
      } else {
        alert(data.message || "User update failed");
      }
    } catch (error) {
      console.error("User update error:", error);
      alert("An error occurred during user update.");
    }
  };

  return (
    <div>
      <h1>Welcome to user page</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            value={Name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit">Update</button>
        </form>
        
      </div>
    </div>
  );
}

export default UserPage;
