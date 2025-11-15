import { Navigate } from "react-router";
import useAuth from "../useAuth/useAuth";

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("Current user:", user);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const adminEmail = "admin@school.com";


  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }


  const isAdmin = user.email === adminEmail;
  const isModerator = user.role === "moderator";
  
  console.log("Is Admin:", isAdmin);
  console.log("Is Moderator:", isModerator);
  console.log("User role:", user.role);


  if (!isAdmin && !isModerator) {
    console.log("User is neither admin nor moderator, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Access granted to super dashboard");
  return children;
}