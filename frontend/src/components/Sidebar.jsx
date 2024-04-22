import {
  PanelLeftOpen,
  PanelLeftClose,
  MoreVertical,
  Home,
  LogIn,
  SearchIcon,
  LogInIcon,
  LogOutIcon,
  BarChart2Icon,
  UserRoundPlus,
  SettingsIcon,
} from "lucide-react";
import { createContext, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

import { useNavigate } from "react-router-dom";
const SidebarContext = createContext();

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { user } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleLogout = () => {
    logout(); // Clear the user authentication state
    navigate("/"); // Redirect to the homepage
  };

  return (
    <>
      <aside className="fixed h-screen w-auto overflow-y-auto bg-white shadow-md">
        <nav className="flex h-full flex-col border-r bg-white shadow-sm">
          <div className="flex items-center justify-between p-4 pb-2">
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="rounded-lg bg-gray-50 p-1.5 hover:bg-gray-100"
            >
              {expanded ? (
                <PanelLeftOpen />
              ) : (
                <PanelLeftClose color="#3e9392" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 pb-2">
            <Link
              to="/"
              className={`btn-ghost mb-8 overflow-hidden text-3xl font-bold transition-all ${expanded ? "w-auto" : "w-0"}`}
            >
              SentimentWatch.
            </Link>
          </div>{" "}
          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3">
              {/* Home Item */}
              <Link
                to={"/"}
                className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
              >
                <Home />
                <Link
                  to="/"
                  className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                >
                  Home
                </Link>
              </Link>

              {/* Login Item */}
              {!user && (
                <Link
                  to={"/login"}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <LogInIcon />
                  <Link
                    to="/login"
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Login
                  </Link>
                </Link>
              )}
              {/* Login Item */}
              {!user && (
                <Link
                  to={"/register"}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <UserRoundPlus />
                  <Link
                    to="/register"
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Register
                  </Link>
                </Link>
              )}

              {user && (
                <Link
                  to={"/search"}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <SearchIcon />
                  <Link
                    to="/search"
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Search
                  </Link>
                </Link>
              )}
              {user && (
                <Link
                  to={"/charts"}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <BarChart2Icon />
                  <Link
                    to="/charts"
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Charts
                  </Link>
                </Link>
              )}
              {isAdmin == 1 && (
                <Link
                  to={"/admin"}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <SettingsIcon />
                  <Link
                    to="/admin"
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Admin
                  </Link>
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className={`group relative my-1 flex cursor-pointer items-center rounded-md px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-indigo-50`}
                >
                  <LogOutIcon />
                  <button
                    style={{ textAlign: "left" }}
                    onClick={handleLogout}
                    className={`overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"}`}
                  >
                    Logout
                  </button>
                </button>
              )}
            </ul>
          </SidebarContext.Provider>
          {user && (
            <div className="flex border-t p-3">
              <div
                className={`flex items-center justify-between overflow-hidden transition-all ${expanded ? "ml-3 w-52" : "w-0"} `}
              >
                <div className="leading-4">
                  <span className="text-sm text-gray-500">Logged in as</span>
                  <h4 className="font-semibold">{user.username}</h4>
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
