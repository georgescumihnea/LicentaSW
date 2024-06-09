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
          const { username, is_admin } = response.data;

          if (username) {
            // Auto-login with the token and username
            login({ username, is_admin, token });
          }
          isAdmin;
        })
        .catch((error) => {
          console.error("Auto-login failed:", error);
          // Optionally handle auto-login failure
        });
    }
  }, []);

  const login = (userData) => {
    setUser({
      username: userData.username,
      token: userData.token,
      isAdmin: userData.is_admin === 1, // Assuming the backend sends it as is_admin
    });
    document.cookie = `token=${userData.token}; path=/; max-age=3600`; // Set token in cookies
  };

  const logout = () => {
    setUser(null);
    document.cookie = "token=; path=/; max-age=-1"; // Remove token cookie
  };

  const isAdmin = () => {
    return user?.isAdmin === true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
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
