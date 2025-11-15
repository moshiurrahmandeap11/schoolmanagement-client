import { useState } from "react";
import { FaEye, FaEyeSlash, FaFacebook, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router"; // Updated to react-router-dom
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";
import useAuth from "../../../hooks/useAuth/useAuth";
import CustomButton from "../../sharedItems/CustomButton/CustomButton";
import Loader from "../../sharedItems/Loader/Loader";

const Login = () => {
  const { loading, user, googleLogin, facebookLogin, logIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleNormalLogin = async () => {
  if (!formData.email || !formData.password) {
    return alert("Please enter email & password");
  }

  try {
    // 1️⃣ Firebase login
    await logIn(formData?.email, formData?.password);

    // 2️⃣ Backend /login API call
    const res = await axiosInstance.post("/users/login", {
      email: formData?.email,
      password: formData?.password,
    });

if (res.data.success) {
  const backendUser = res.data.user; // <-- backend user
  console.log("Login success:", backendUser);

  if (backendUser.email === "admin@school.com") {
    navigate("/super/dashboard");
  } else {
    navigate("/");
  }
}

  } catch (err) {
    console.error("Login failed:", err.response?.data?.message || err.message);
    alert(err.response?.data?.message || "Login failed. Please try again.");
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

  // If already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-semibold text-[#0F5EF6]">
          You are already logged in, {user.displayName || user.email}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-bold text-[#0F5EF6]">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login to access your BrightFuture School dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="space-y-6">
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

            {/* Submit Button */}
            <div>
              <CustomButton onClick={handleNormalLogin} className="w-full cursor-pointer">
                Login
              </CustomButton>
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
              className="flex cursor-pointer items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              <FaGoogle size={24} className="text-[#0F5EF6]" />
            </button>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex cursor-pointer items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              <FaFacebook size={24} className="text-[#0F5EF6]" />
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/auth/signup" className="text-[#0F5EF6] hover:underline transition-colors duration-300">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;