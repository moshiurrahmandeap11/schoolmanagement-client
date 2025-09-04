import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth/useAuth";
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";
import Loader from "../../sharedItems/Loader/Loader";

const SignUp = () => {
    const { loading, user, googleLogin, facebookLogin, createUser } = useAuth();
    const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



// Normal signup
const handleSignUp = async () => {
  const { fullName, email, password, confirmPassword } = formData;

  console.log("Form data:", formData); // 🔹 Add this

  if (!fullName || !email || !password || !confirmPassword) {
    return alert("All fields are required!");
  }

  if (password !== confirmPassword) {
    return alert("Passwords do not match!");
  }

  try {
    // 1️⃣ Firebase signup
    const res = await createUser(email, password);
    console.log("Firebase signup success:", res.user);

    const idToken = await res.user.getIdToken();

    // 2️⃣ Backend signup
    const backendRes = await axiosInstance.post("/users/signup", {
      fullName,
      email,
      idToken, // Firebase token
    });

    if (backendRes.data.success) {
      console.log("✅ Backend signup success:", backendRes.data.user);
      navigate("/dashboard"); // Redirect to dashboard
    }
  } catch (err) {
    console.error("Signup failed:", err.response?.data?.message || err.message);
    alert(err.response?.data?.message || "Signup failed. Please try again.");
  }
};


    // Google login
  const handleGoogleLogin = async () => {
    try {
      console.log("Starting Google login...");
      const res = await googleLogin();
      console.log("Firebase login success:", res.user);
      const idToken = await res.user.getIdToken();
      console.log("Firebase ID token obtained:", idToken);
      const backendRes = await axiosInstance.post("/users/google-login", { idToken });
      if (backendRes.data.success) {
        console.log("✅ Google login success:", backendRes.data.user);
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      console.error("Error details:", err.code, err.message);
      alert(err.response?.data?.message || err.message || "Google login failed. Please try again.");
    }
  };


    // Facebook login
  const handleFacebookLogin = async () => {
    try {
      console.log("Starting Facebook login...");
      const res = await facebookLogin();
      console.log("Firebase login success:", res.user);
      const idToken = await res.user.getIdToken();
      console.log("Firebase ID token obtained:", idToken);
      const backendRes = await axiosInstance.post("/users/facebook-login", { idToken });
      if (backendRes.data.success) {
        console.log("✅ Facebook login success:", backendRes.data.user);
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (err) {
      console.error("❌ Facebook login failed:", err);
      console.error("Error details:", err.code, err.message);
      alert(err.response?.data?.message || err.message || "Facebook login failed. Please try again.");
    }
  };


    // If loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-bold text-[#0F5EF6]">
            Login to BrightFuture School
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an account or sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#0F5EF6]"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#0F5EF6]"
                >
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleSignUp}
                className="w-full bg-[#0F5EF6] text-white py-2 px-4 rounded-md hover:bg-[#0b4cd1] transition-colors duration-300 text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
                onClick={handleGoogleLogin}
              className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              <FaGoogle size={24} className="text-[#0F5EF6]" />
            </button>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              <FaFacebook size={24} className="text-[#0F5EF6]" />
            </button>
          </div>

          {/* Privacy Policy & Terms */}
          <div className="mt-6 text-center text-sm text-gray-600">
            By signing up, you agree to our{" "}
            <Link
              to="/terms-and-conditions"
              className="text-[#0F5EF6] hover:underline transition-colors duration-300"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-[#0F5EF6] hover:underline transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;