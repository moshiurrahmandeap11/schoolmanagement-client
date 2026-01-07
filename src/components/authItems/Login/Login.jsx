import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import Swal from 'sweetalert2';
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";
import useAuth from "../../../hooks/useAuth/useAuth";
import CustomButton from "../../sharedItems/CustomButton/CustomButton";

const Login = () => {
  const { loading, user, googleLogin, logIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Auto redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/super/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNormalLogin = async () => {
    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'ফর্ম সম্পূর্ণ নয়',
        text: 'ইমেইল এবং পাসওয়ার্ড দিন',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      // Firebase login
      await logIn(formData?.email, formData?.password);

      // Backend /login API call
      const res = await axiosInstance.post("/users/login", {
        email: formData?.email,
        password: formData?.password,
      });

      if (res.data.success) {
        const backendUser = res.data.user;
        console.log("Login success:", backendUser);

        Swal.fire({
          icon: 'success',
          title: 'লগইন সফল!',
          text: 'ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });

        setTimeout(() => {
          if (backendUser.email === "admin@school.com") {
            navigate("/super/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      }

    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      
      let errorMessage = "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
      
      // Firebase specific errors
      if (err.code) {
        switch(err.code) {
          case 'auth/user-not-found':
            errorMessage = "ইমেইল এড্রেসটি পাওয়া যায়নি।";
            break;
          case 'auth/wrong-password':
            errorMessage = "পাসওয়ার্ড ভুল হয়েছে।";
            break;
          case 'auth/too-many-requests':
            errorMessage = "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।";
            break;
          case 'auth/user-disabled':
            errorMessage = "এই একাউন্টটি নিষ্ক্রিয় করা হয়েছে।";
            break;
          default:
            errorMessage = err.message || "লগইন ব্যর্থ হয়েছে।";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'লগইন ব্যর্থ',
        text: errorMessage,
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      console.log("Starting Google login...");
      const res = await googleLogin();
      console.log("Firebase login success:", res.user);
      const idToken = await res.user.getIdToken();
      console.log("Firebase ID token obtained:", idToken);
      
      const backendRes = await axiosInstance.post("/users/google-login", { idToken });
      
      if (backendRes.data.success) {
        console.log("✅ Google login success:", backendRes.data.user);
        
        Swal.fire({
          icon: 'success',
          title: 'গুগল লগইন সফল!',
          text: 'ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });

        setTimeout(() => {
          navigate("/super/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      console.error("Error details:", err.code, err.message);
      
      let errorMessage = "গুগল লগইন ব্যর্থ হয়েছে।";
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "লগইন পপআপ বন্ধ করা হয়েছে।";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'গুগল লগইন ব্যর্থ',
        text: errorMessage,
        confirmButtonText: 'ঠিক আছে'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };





  // If already logged in
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">
          You are already logged in, {user.displayName || user.email}
        </h2>
        <button
          onClick={() => navigate("/super/dashboard")}
          className="px-6 py-2 bg-[#0F5EF6] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
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
          {isLoggingIn ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mt-4 text-gray-600">লগইন হচ্ছে...</p>
            </div>
          ) : (
            <>
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
                    disabled={isLoggingIn}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoggingIn}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5EF6] focus:border-[#0F5EF6] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoggingIn}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#0F5EF6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <CustomButton 
                    onClick={handleNormalLogin} 
                    disabled={isLoggingIn}
                    className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? "লগইন হচ্ছে..." : "Login"}
                  </CustomButton>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="grow h-px bg-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">or continue with</span>
                <div className="grow h-px bg-gray-300"></div>
              </div>

              {/* Social Login */}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaGoogle size={24} className="text-[#0F5EF6]" />
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/auth/signup" 
                  className="text-[#0F5EF6] hover:underline transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;