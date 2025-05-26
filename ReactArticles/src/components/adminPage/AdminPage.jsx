import React from "react";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

function AdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome to admin page</h1>
      <div>
        <p>Admin: {user.name}</p>
      </div>
    </div>
  );
}

export default AdminPage;
