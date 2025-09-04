import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import logo from "../../../assets/logo.jpeg";
import useAuth from "../../../hooks/useAuth/useAuth";
import Loader from "../Loader/Loader";
import CustomButton from "../CustomButton/CustomButton";
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, logOut } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/users/uid/${user?.uid}`);
        setProfile(res.data.data);
      } catch {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user?.uid]);

  const navlinks = (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `relative text-lg font-medium transition-colors duration-300 ${
            isActive ? "text-[#0F5EF6]" : "text-gray-800 hover:text-[#0F5EF6]"
          } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
            isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) =>
          `relative text-lg font-medium transition-colors duration-300 ${
            isActive ? "text-[#0F5EF6]" : "text-gray-800 hover:text-[#0F5EF6]"
          } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
            isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`
        }
      >
        About
      </NavLink>
      <NavLink
        to="/author"
        className={({ isActive }) =>
          `relative text-lg font-medium transition-colors duration-300 ${
            isActive ? "text-[#0F5EF6]" : "text-gray-800 hover:text-[#0F5EF6]"
          } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
            isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`
        }
      >
        Author
      </NavLink>
      <NavLink
        to="/results"
        className={({ isActive }) =>
          `relative text-lg font-medium transition-colors duration-300 ${
            isActive ? "text-[#0F5EF6]" : "text-gray-800 hover:text-[#0F5EF6]"
          } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
            isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`
        }
      >
        Results
      </NavLink>
      <NavLink
        to="/contact"
        className={({ isActive }) =>
          `relative text-lg font-medium transition-colors duration-300 ${
            isActive ? "text-[#0F5EF6]" : "text-gray-800 hover:text-[#0F5EF6]"
          } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
            isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
          }`
        }
      >
        Contact
      </NavLink>
    </>
  );

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed: " + error.message);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4">
            <img
              className="w-full max-w-[72px] h-auto rounded-2xl object-contain"
              src={logo}
              alt="BrightFuture Logo"
            />
            <h1 className="text-xl font-bold">BrightFuture International</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:gap-10">
            {navlinks}
          </div>

          {/* Login/Logout Button */}
          <div className="hidden md:block">
            {user ? (
              <>
                <span className="text-lg font-medium text-gray-800">
                  {profile?.fullName || "Guest"}
                </span>
                <CustomButton onClick={handleLogOut} className="ml-4">
                  Logout
                </CustomButton>
              </>
            ) : (
              <CustomButton onClick={handleLogin}>
                Login
              </CustomButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-[#0F5EF6] focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col gap-4 px-4 py-6">
            {navlinks}
            {user ? (
              <>
                <span className="text-lg font-medium text-gray-800">
                  {profile?.fullName || "Guest"}
                </span>
                <CustomButton onClick={handleLogOut}>
                  Logout
                </CustomButton>
              </>
            ) : (
              <CustomButton onClick={handleLogin}>
                Login
              </CustomButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;