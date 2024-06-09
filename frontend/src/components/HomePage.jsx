import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

function HomePage() {
  // User is not logged in, show the login form
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <div className="mt-6 flex flex-col items-center font-mono lg:mt-20">
        <h1
          className="text-center text-2xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
          data-aos="fade-in"
          data-aos-duration="300"
          data-aos-once="true"
          data-aos-delay="300"
        >
          SentimentWatch -
          <span
            className="bg-gradient-to-r from-blue-500 to-red-800 bg-clip-text font-medium text-transparent"
            data-aos="fade-in"
            data-aos-duration="350"
            data-aos-once="true"
            data-aos-delay="400"
          >
            {" "}
            Reddit sentiment analyzer
          </span>
        </h1>
        <p
          className="mt-10 max-w-4xl text-center text-lg text-black"
          data-aos="fade-in"
          data-aos-duration="300"
          data-aos-once="true"
          data-aos-delay="500"
        >
          The application will automatically search Reddit for selected topics,
          retrieving relevant posts. It will then use natural language
          processing to parse these posts, extracting key entities and topics.
          The core functionality involves analyzing the sentiment of these posts
          (positive, negative, neutral) and tracking their evolution over time
        </p>
        <div
          className="my-10 flex justify-center"
          data-aos="zoom-in"
          data-aos-duration="300"
          data-aos-once="true"
          data-aos-delay="600"
        >
          <a
            href="/login"
            className="btn mx-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-800 px-4 py-3 text-white"
          >
            Start for free
          </a>
        </div>
        <div
          className="mt-10 flex justify-center gap-4 text-white"
          data-aos="fade-up"
          data-aos-duration="300"
          data-aos-once="true"
          data-aos-delay="700"
          data-aos-anchor-placement="bottom-bottom"
        >
          <div className="card bg-blue-600">
            <div className="card-body">
              Hey there! 👋 Welcome to SentimentWatch. 👋
            </div>
          </div>
          <div className="card bg-blue-600">
            <div className="card-body">
              Hey there! 👋 Welcome to SentimentWatch. 👋
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
