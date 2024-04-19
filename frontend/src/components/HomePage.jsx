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
        {/* Background icons container */}
        {/* <div
          className="absolute left-0 top-0 z-0 h-full w-full"
          style={{ overflow: "hidden" }}
        >
          <div
            className="rounded-full bg-blue-500"
            style={{
              position: "absolute",

              // Set the color of your icons
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z" />
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165" />
            </svg>
          </div>
        </div> */}
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
