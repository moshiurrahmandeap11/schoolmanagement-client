import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import Loader from "../../components/sharedItems/Loader/Loader";
import axiosInstance from "../axiosInstance/axiosInstance";
import useAuth from "../useAuth/useAuth";

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  console.log("User UID:", user?.uid);
  console.log("User Email:", user?.email);

  // Fetch user role from API based on firebaseUid
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.uid) {
        setRoleLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/users/uid/${user.uid}`);
        console.log("API Response:", response.data);

        if (response.data?.data) {
          setUserRole(response.data.data.role);
          console.log("User Role Set:", response.data.data.role);
        } else {
          setError("User data not found");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError("Failed to fetch user data");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.uid]);

  const isLoading = loading || roleLoading;

  if (isLoading) {
    console.log("Still loading...");
    return <Loader />;
  }

  if (!user) {
    console.log("No user found - redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  if (error) {
    console.log("Error occurred:", error);
    return <Navigate to="/" replace />;
  }

  console.log("Final Check - User Role:", userRole);
  console.log("Final Check - User Email:", user?.email);

  // Wait until userRole is properly set
  if (userRole === null) {
    console.log("User role still null - showing loader");
    return <Loader />;
  }

  // Improved role checking logic
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";

  console.log("Is Admin:", isAdmin);
  console.log("Is Moderator:", isModerator);

  // Allow both admin and moderator roles
  if (isAdmin || isModerator) {
    console.log("Access granted - rendering children");
    return children;
  }

  console.log("Access denied - redirecting to home");
  return <Navigate to="/" replace />;
}