import React from "react";
import { NavLink } from "react-router";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import SubFooter from "./SubFooter/SubFooter";

const Footer = () => {
  return (
    <div>
<SubFooter></SubFooter>
    <footer className="bg-black text-white py-8">
<div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-center">
          <h1 className="text-sm sm:text-base md:text-lg font-medium text-gray-300">
            সর্বস্বত্ব সংরক্ষিত © ২০২৫ 
            <a href="https://projuktisheba.com" target="_blank" className="text-blue-400 ml-1">প্রযুক্তি সেবা</a>
          </h1>
        </div>
      </div>
    </div>
    </footer>
    </div>
  );
};

export default Footer;