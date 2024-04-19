// components/LogoutButton.jsx
import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear the user authentication state
    navigate("/"); // Redirect to the homepage
  };

  return (
    <button
      onClick={handleLogout}
      className="btn mx-4 bg-orange-500 text-white"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
