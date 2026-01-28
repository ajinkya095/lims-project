import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowed, children }) => {
  const userId = localStorage.getItem("userId");

  // Not logged in → go to Login
  if (!userId) return <Navigate to="/" replace />;

  // Logged in but no permission → go to Unauthorized page
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
