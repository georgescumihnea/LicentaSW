import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const { user } = useAuth();

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className="relative mx-auto flex h-24 max-w-[1240px] items-center justify-between px-4 text-white">
      <Link
        className="flex w-full flex-col font-mono text-5xl font-bold text-[#2b394d]"
        to="/"
      >
        SentimentWatch.
      </Link>

      {/* Navigation Links (Visible on all sizes, better approach) */}
      <ul className="hidden items-center space-x-8 md:flex">
        {user && (
          <>
            <li>
              {" "}
              <Link to="/search" className="btn bg-orange-500 text-white">
                Search
              </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/dashboard" className="btn bg-orange-500 text-white">
                Dashboard
              </Link>{" "}
            </li>
            <li>
              {" "}
              <Link to="/getUser" className="btn bg-orange-500 text-white">
                Charts
              </Link>
            </li>
          </>
        )}
        {!user && (
          <li>
            {" "}
            <Link
              to="/login"
              className="btn bg-orange-500 text-white hover:bg-orange-700"
            >
              Login
            </Link>{" "}
          </li>
        )}
        {user && (
          <li>
            <LogoutButton />
          </li>
        )}
      </ul>

      {/* Hamburger Button */}
      <div onClick={handleNav} className="z-30 block bg-orange-500 md:hidden">
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>

      {/* Mobile Menu */}
      <ul
        className={
          nav
            ? "absolute left-0 top-0 z-30 h-full w-[60%] border-r border-r-gray-900 bg-[#000300] px-4 py-8 text-xl duration-300 ease-in-out"
            : "absolute left-[-100%] z-30 duration-300 ease-in-out"
        }
      >
        <Link
          className="mb-8 w-full text-3xl font-bold text-[#00df9a]"
          to="/"
          onClick={handleNav} // Close menu after clicking
        >
          SentimentWatch.
        </Link>

        {user && (
          <>
            <li className="w-full border-b border-gray-600 bg-[#000300] p-4">
              <Link to="/search" onClick={handleNav}>
                Searchs
              </Link>
            </li>
            <li className="w-full border-b border-gray-600 bg-[#000300] p-4">
              <Link to="/dashboard" onClick={handleNav}>
                Dashboard
              </Link>
            </li>
            <li className="w-full border-b border-gray-600 bg-[#000300] p-4">
              <Link to="/getUser" onClick={handleNav}>
                Charts
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
