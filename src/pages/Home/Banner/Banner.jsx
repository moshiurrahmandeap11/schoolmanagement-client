import React from 'react';
import { Link } from 'react-router';

const Banner = () => {
  return (
    <section className="relative bg-black/30">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://i.postimg.cc/jSHNHxKr/images.jpg')",
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-24 flex flex-col items-center text-center text-white">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Welcome to Our School
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl">
          Empowering students with knowledge, values, and skills for a bright future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/about"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Learn More
          </Link>
          <Link
            href="/contact"
            className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Banner;
