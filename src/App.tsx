import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { useAuth } from "./hooks/useAuth";
import { setUser } from "./store/slices/authSlice";

import Login from "./pages/Login";
import Gate from "./pages/Gate";
import Checkpoint from "./pages/Checkpoint";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { isAuthenticated, token, isAdmin, isEmployee } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || isAuthenticated) return;

    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("No user data found with token");
        localStorage.removeItem("token");
        return;
      }

      const user = JSON.parse(userData);

      if (!user.id || !user.username || !user.role) {
        console.error("Invalid user data", user);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      dispatch(
        setUser({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name || user.username,
        })
      );
    } catch (error) {
      console.error("Failed to process user/token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/gate/:gateId" element={<Gate />} />
      <Route
        path="/checkpoint"
        element={
          <ProtectedRoute requireEmployee>
            <Checkpoint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : isEmployee ? (
              <Navigate to="/checkpoint" replace />
            ) : (
              <Navigate to="/gate/default" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
