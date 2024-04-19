// ProtectedContent.jsx
import React from "react";
import { useUser } from "@clerk/clerk-react";
import SubredditSearch from "./SubredditSearch";
import Navbar from "./Navbar";
import Hero from "./Hero";
import { SignIn, SignUp } from "@clerk/clerk-react";

function ProtectedContent() {
  const { user } = useUser();

  if (!user) {
    return (
      <div>
        Please sign in <SignIn />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Hero />
      <SubredditSearch />
    </>
  );
}

export default ProtectedContent;
