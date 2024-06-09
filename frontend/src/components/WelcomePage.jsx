import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext"; // import the useAuth hook
import { useNavigate } from "react-router-dom"; // import useNavigate for navigation

function WelcomePage() {
  const [clients, setClients] = useState([]);
  const { user } = useAuth(); // Get the user data from AuthContext
  const navigate = useNavigate(); // Get navigate function for navigation

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/clients", {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Use the token from the user data
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      }
    };

    fetchClients();
  }, [user]);

  const handleViewDetails = (clientId) => {
    console.log("View details for client ID:", clientId);
    // Implement the navigation to the client details page
  };

  const handleRunSearch = (clientId) => {
    console.log("Run search for client ID:", clientId);
    navigate(`/analyze_data?client_id=${clientId}`);
  };

  return (
    <div className="mx-auto flex max-w-5xl p-6">
      <div className="w-full">
        <div className="card bg-base-200 p-4 shadow">
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="mb-2 text-5xl font-bold">
              Welcome to SentimentWatch
            </div>
            <div className="mb-6 text-2xl">
              Your one stop for all things sentiment analysis
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>CEO</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(([id, name, ceo]) => (
                  <tr key={id}>
                    <td>{name}</td>
                    <td>{ceo}</td>
                    <td>
                      <button
                        className="btn btn-sm bg-blue-400 text-white"
                        onClick={() => handleViewDetails(id)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm ml-2 bg-blue-400 text-white"
                        onClick={() => handleRunSearch(id)}
                      >
                        Run Search
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
