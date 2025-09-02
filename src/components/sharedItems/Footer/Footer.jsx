import React from "react";
import { NavLink } from "react-router";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Information */}
          <div>
            <h3 className="text-2xl font-bold text-[#0F5EF6] mb-4">BrightFuture School</h3>
            <p className="text-sm mb-2">123 Education Lane, Knowledge City, ED 12345</p>
            <p className="text-sm mb-2">Phone: (123) 456-7890</p>
            <p className="text-sm mb-2">Email: info@brightfutureschool.edu</p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-[#0F5EF6] transition-colors duration-300"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-[#0F5EF6] transition-colors duration-300"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-[#0F5EF6] transition-colors duration-300"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-[#0F5EF6] transition-colors duration-300"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-[#0F5EF6] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-sm transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
                      isActive ? "text-[#0F5EF6] after:w-full" : "text-gray-800 hover:text-[#0F5EF6] after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-sm transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
                      isActive ? "text-[#0F5EF6] after:w-full" : "text-gray-800 hover:text-[#0F5EF6] after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/author"
                  className={({ isActive }) =>
                    `text-sm transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
                      isActive ? "text-[#0F5EF6] after:w-full" : "text-gray-800 hover:text-[#0F5EF6] after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Author
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/results"
                  className={({ isActive }) =>
                    `text-sm transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
                      isActive ? "text-[#0F5EF6] after:w-full" : "text-gray-800 hover:text-[#0F5EF6] after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Results
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `text-sm transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-[#0F5EF6] after:transition-all after:duration-300 ${
                      isActive ? "text-[#0F5EF6] after:w-full" : "text-gray-800 hover:text-[#0F5EF6] after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-xl font-semibold text-[#0F5EF6] mb-4">About Us</h3>
            <p className="text-sm">
              BrightFuture School is dedicated to fostering academic excellence and personal growth. Join us in shaping the leaders of tomorrow.
            </p>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800">Newsletter</h4>
              <div className="mt-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F5EF6]"
                />
                <button className="mt-2 bg-[#0F5EF6] text-white px-4 py-2 rounded-md hover:bg-[#0b4cd1] transition-colors duration-300 w-full">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} BrightFuture School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;