import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // import the useAuth hook

function SubredditSearch() {
  const [topic, setTopic] = useState("");
  const [commentLimit, setCommentLimit] = useState(""); // Initialize commentLimit state
  const [postLimit, setPostLimit] = useState(""); // Initialize commentLimit state
  const [postsData, setPostsData] = useState([]);
  //const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Get the user data from AuthContext
  const calculateETA = (postLimit, commentLimit) => {
    const averageTimePerPost = 2; // Average time per post in seconds (example)
    const averageTimePerComment = 0.5; // Average time per comment in seconds (example)
    return (
      (postLimit * averageTimePerPost +
        postLimit * commentLimit * averageTimePerComment) /
      60
    );
  };

  const renderContent = (content) => {
    // Check if content is a URL
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i",
    ); // fragment locator

    if (urlPattern.test(content)) {
      return (
        <a
          className="text-black hover:text-blue-300 hover:underline"
          href={content}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    } else {
      return <p className="text-justify tracking-wide text-black">{content}</p>;
    }
  };
  const handleSearch = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/search_subreddits?topic=${topic}&comment_limit=${commentLimit}&postLimit=${postLimit}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Use the token from the user data
          },
        },
      );
      console.log(user.token);
      console.log(user.username);
      //show th
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPostsData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEntities = (entitiesJson) => {
    try {
      const entities = JSON.parse(entitiesJson);
      return entities.map((entity, idx) => (
        <span
          key={idx}
          className="mx-2 my-2 line-clamp-2 text-justify font-semibold tracking-wide text-black"
        >
          {entity[0]}{" "}
          <span className="mx-2 my-2 font-semibold text-secondary">
            ({entity[1]})
          </span>
        </span>
      ));
    } catch (error) {
      console.error("Error parsing entities: ", error);
      return <span>Failed to load entities</span>;
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
            placeholder="Comment Limit"
          />
          <input
            type="number"
            value={postLimit}
            onChange={(e) => setPostLimit(e.target.value)}
            className="input input-bordered input-info w-full max-w-xs"
            placeholder="Post Limit"
          />
        </div>
        <button onClick={handleSearch} className="btn bg-blue-500 text-white">
          Search Subreddits
        </button>
      </div>

      {isLoading ? (
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
          <div className="mx-auto mt-12 text-xl text-primary">
            Retrieving Data from Reddit, this might take a while...
            <div>
              Estimated Time: {calculateETA(postLimit, commentLimit)} minutes
            </div>
          </div>
        </div>
      ) : (
        postsData.map((post, index) => (
          <div
            key={index}
            className="mb-8 overflow-auto rounded-lg bg-warning shadow-lg"
          >
            <div className="p-6">
              <h2 className="mb-2 text-xl font-bold">{post.title}</h2>
              <div className="content collapse mb-4 bg-accent text-black">
                <input type="checkbox" />
                <div className="collapse-title text-xl font-medium text-black">
                  Click me to show/hide content
                </div>
                <div className="collapse-content font-semibold text-black">
                  {renderContent(post.content)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-pin-rows table-pin-cols table-xs">
                  <thead className="">
                    <tr>
                      <th className="">Comment</th>
                      <th className="">Date</th>
                      <th className="">Sentiment</th>
                      <th className="">Entities</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {post.comments.map((comment, idx) => (
                      <tr key={idx}>
                        <td className="text-justify font-medium leading-relaxed tracking-normal text-black">
                          {comment.body}
                        </td>
                        <td className="font-bold tracking-normal tracking-wide text-black">
                          {comment.created_date}
                        </td>
                        <td className="text-justify font-black tracking-wide text-black">
                          {comment.sentiment.compound.toFixed(2)}
                        </td>
                        <td className="text-justify font-black tracking-wide text-black">
                          {renderEntities(comment.entities)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SubredditSearch;
