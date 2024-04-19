// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import SearchPage from "./components/SearchPage";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./components/AuthContext";
import { useAuth } from "./components/AuthContext";
import RegisterPage from "./components/RegisterPage";
import ChartsPage from "./components/ChartsPage";
import Dashboard from "./Dashboard";
import { CSSTransition } from "react-transition-group";
import LoginPage from "./components/LoginPage";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <MoveToIndexQuickBugFix>
                <RegisterPage />
              </MoveToIndexQuickBugFix>
            }
          />{" "}
          {/* Add this line */}
          <Route
            path="/charts"
            element={
              <ProtectedRoute>
                <ChartsPage />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>{" "}
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

function MoveToIndexQuickBugFix({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
}

export default App;
