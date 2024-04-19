import { useState } from "react";
import PropTypes from "prop-types";

CommentsFetch.propTypes = {
  subreddits: PropTypes.arrayOf(PropTypes.string),
};

function CommentsFetch({ subreddits }) {
  const [selectedSubreddit, setSelectedSubreddit] = useState("");
  const [comments, setComments] = useState([]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/fetch_comments?subreddit=${selectedSubreddit}`,
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error:", error);
      setComments([]); // Reset or handle error
    }
  };

  return (
    <div>
      <select onChange={(e) => setSelectedSubreddit(e.target.value)}>
        <option value="">Select a Subreddit</option>
        {subreddits.map((subreddit, index) => (
          <option key={index} value={subreddit}>
            {subreddit}
          </option>
        ))}
      </select>
      <button onClick={fetchComments}>Fetch Comments</button>
      <ul>
        {comments.map((comment, index) => (
          <li key={index}>
            <p>{comment.body}</p>
            <p>Sentiment: {comment.sentiment.compound}</p>
            <ul>
              {comment.entities &&
                Array.isArray(comment.entities) &&
                comment.entities.map((entity, idx) => (
                  <li key={idx}>
                    {entity[0]} ({entity[1]})
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentsFetch;
