import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      axios
        .get("http://localhost:5000/auto_login", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { username } = response.data;
          if (username) {
            // Auto-login with the token and username
            login({ username, token });
          }
        })
        .catch((error) => {
          console.error("Auto-login failed:", error);
          // Optionally handle auto-login failure
        });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    document.cookie = `token=${userData.token}; path=/; max-age=3600`; // Set token in cookies
  };

  const logout = () => {
    setUser(null);
    document.cookie = "token=; path=/; max-age=-1"; // Remove token cookie
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export default AuthProvider;
