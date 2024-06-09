import React, { useState } from "react";
import { useAuth } from "./AuthContext"; // import the useAuth hook
import { useLocation } from "react-router-dom";

function SubredditSearch() {
  const [topic, setTopic] = useState("");
  const [commentLimit, setCommentLimit] = useState(""); // Initialize commentLimit state
  const [postLimit, setPostLimit] = useState(""); // Initialize postLimit state
  const [isLoading, setIsLoading] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const { user } = useAuth(); // Get the user data from AuthContext
  const location = useLocation(); // Get the location object

  // Extract client ID from the query parameters
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get("client_id");

  const handleSearch = async () => {
    if (!clientId) {
      console.error("Client ID is required to run a search.");
      return;
    }

    setIsLoading(true);
    setTaskCompleted(false);

    try {
      const response = await fetch(
        `http://localhost:5000/search_subreddits?topic=${topic}&comment_limit=${commentLimit}&postLimit=${postLimit}&client_id=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Use the token from the user data
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTaskCompleted(true);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex flex-col items-center gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input input-bordered input-info w-full max-w-3xl text-center"
          placeholder="Enter a topic..."
        />
        <div className="flex gap-4">
          <input
            type="number"
            value={commentLimit}
            onChange={(e) => setCommentLimit(e.target.value)}
            className="input input-bordered input-info w-full max-w-xs"
            placeholder="Comments Per Post"
          />
          <input
            type="number"
            value={postLimit}
            onChange={(e) => setPostLimit(e.target.value)}
            className="input input-bordered input-info w-full max-w-xs"
            placeholder="Amount of Posts"
          />
        </div>
        <button onClick={handleSearch} className="btn bg-blue-500 text-white">
          Analyze keywords in Subreddits Topics
        </button>
      </div>

      {isLoading ? (
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
          <div className="mx-auto mt-12 text-xl text-primary">
            Analyzing data from Reddit & updating the database...
          </div>
        </div>
      ) : (
        taskCompleted && (
          <div className="flex items-center justify-center">
            <div className="text-green-500">
              ✅ Task completed, successfully analyzed {topic}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default SubredditSearch;
