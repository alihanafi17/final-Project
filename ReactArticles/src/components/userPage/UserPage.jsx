import React from "react";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

function UserPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome to user page</h1>
      <div>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
    </div>
  );
}

export default UserPage;
