// components/GetUserPage.jsx
import React, { useState } from "react";
import axios from "axios";
import SentimentCharts from "./SentimentCharts";
import EntitySentimentChart from "./EntitySentimentChart";
import SentimentChartsBar from "./SentimentChartsBar";

function GetUserPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchSearches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/get_user_searches",
        {
          headers: { Authorization: `Bearer ${getCookie("token")}` },
        },
      );
      setSearches(response.data);
      console.log("Searches:", response.data);
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  var count = 1;

  if (count < 0) count++;

  return (
    <>
      <div className="mx-auto max-w-7xl p-4">
        <div className="card bg-base-200 px-4 py-4 shadow">
          <SentimentCharts />
        </div>
        <div className="card mt-8 bg-base-200 px-4 py-4 shadow">
          <SentimentChartsBar />
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 flex flex-col items-center gap-4 text-center">
          <button
            onClick={handleFetchSearches}
            className="btn mb-4 bg-blue-400"
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch My Searches"}
          </button>
          <div>
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Query</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {searches
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((search, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{search.query}</td>
                      <td className="border px-4 py-2">{search.date}</td>
                      <td className="border px-4 py-2">{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export default GetUserPage;
