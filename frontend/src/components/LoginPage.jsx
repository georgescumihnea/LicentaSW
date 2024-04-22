import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import WelcomePage from "./WelcomePage";

function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user, login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      const { token } = response.data;
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=3600`;
        login({ username, token });
        setErrorMessage(""); // Clear any existing error message
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx and the error is what the backend sent
        console.error("Login failed:", error.response.data);
        setErrorMessage(error.response.data.error); // Use the error message from the response
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Login failed:", error.request);
        setErrorMessage("No response from the server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  if (user && user.username) {
    // User is logged in, show the hero section
    return <WelcomePage />;
  }

  // User is not logged in, show the login form
  return (
    <>
      <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-6 transition-all sm:py-12 ">
        <div className="relative py-3 sm:mx-auto sm:max-w-xl">
          <div className="absolute inset-0 -skew-y-6 transform animate-pulse bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg duration-1000 sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
          <div className="relative bg-white px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
            <div className="mx-auto max-w-md">
              <div>
                Hello
                <h1 className="text-2xl font-semibold">Login</h1>
                {errorMessage && (
                  <div className="mb-3 text-sm text-red-600">
                    {errorMessage}
                  </div> // Display error message
                )}
              </div>
              <div className="divide-y divide-gray-200">
                <div className="space-y-4 py-8 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
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
                      onClick={handleLogin}
                    >
                      Login
                    </button>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-blue-500 hover:text-blue-700"
                    >
                      Don't have an account?{" "}
                      <span className="underline">Register here!</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
