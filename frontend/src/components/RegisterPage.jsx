// components/RegisterPage.jsx
import React, { useState } from "react";
import axios from "axios"; // axios for HTTP requests
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // New state for error messages
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!username || !password) {
      setError("Username and password are required.");
      return; // Stop the function if there is an error
    }

    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      navigate("/"); // Navigate to login page assuming route is '/'
    } catch (error) {
      console.error("Registration failed:", error);
      // Extract error message from response if possible, otherwise use a default message
      setError(
        error.response?.data?.message ||
          "Registration failed. The username might be taken already.",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-6 transition-all sm:py-12">
      <div className="relative py-3 sm:mx-auto sm:max-w-xl">
        <div className="absolute inset-0 -skew-y-6 transform animate-pulse bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
        <div className="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="mx-auto max-w-md">
            <div>
              <h1 className="text-2xl font-semibold">Register</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="space-y-4 py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                {error && <div className="text-sm text-red-500">{error}</div>}
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(""); // Clear error when user starts typing again
                    }}
                    placeholder="Enter your username"
                    className="focus:borer-rose-600 peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none"
                    required
                  />
                  <label
                    for="username"
                    className="peer-placeholder-shown:text-gray-440 absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
                  >
                    Username
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(""); // Clear error when user starts typing again
                    }}
                    placeholder="Enter your password"
                    className="focus:borer-rose-600 peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none"
                    required
                  />
                  <label
                    for="password"
                    className="peer-placeholder-shown:text-gray-440 absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-gray-600"
                  >
                    Password
                  </label>
                </div>
                <div className="relative flex flex-col">
                  <button
                    type="submit"
                    className="btn rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-700"
                    onClick={handleRegister}
                  >
                    Register
                  </button>
                  <Link
                    to="/"
                    className="text-sm font-medium text-blue-500 hover:text-blue-700"
                  >
                    Already registered?{" "}
                    <span className="underline">Login here!</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
