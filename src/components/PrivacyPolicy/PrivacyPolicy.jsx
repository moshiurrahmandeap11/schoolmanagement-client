import React from "react";
import { NavLink } from "react-router";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-[#0F5EF6] mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            At BrightFuture School, we are committed to protecting your privacy. Please read our Privacy Policy carefully.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">1. Introduction</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              This Privacy Policy explains how BrightFuture School collects, uses, and protects your personal information when you use our website and services. By using our website, you consent to the practices described in this policy.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may collect personal information such as your name, email address, phone number, and payment details when you enroll in our programs, create an account, or contact us. We also collect non-personal information like browsing behavior and IP addresses to improve our services.
            </p>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your information is used to provide educational services, process payments, communicate updates, and enhance your experience on our website. We may also use anonymized data for analytics and to improve our offerings.
            </p>
          </div>

          {/* Section 4: Data Protection */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">4. Data Protection</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We implement industry-standard security measures, including encryption and secure servers, to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* Section 5: Sharing Your Information */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">5. Sharing Your Information</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We do not sell or rent your personal information. We may share your information with trusted third parties (e.g., payment processors) to provide our services, but only under strict confidentiality agreements.
            </p>
          </div>

          {/* Section 6: Cookies and Tracking */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Our website uses cookies to enhance your browsing experience and analyze usage patterns. You can manage cookie preferences through your browser settings. Learn more in our{" "}
              <NavLink
                to="/cookies"
                className="text-[#0F5EF6] hover:underline transition-colors duration-300"
              >
                Cookie Policy
              </NavLink>.
            </p>
          </div>

          {/* Section 7: Your Rights */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">7. Your Rights</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              You have the right to access, update, or delete your personal information. To exercise these rights, please contact us at{" "}
              <a
                href="mailto:info@brightfutureschool.edu"
                className="text-[#0F5EF6] hover:underline transition-colors duration-300"
              >
                info@brightfutureschool.edu
              </a>.
            </p>
          </div>

          {/* Section 8: Changes to Privacy Policy */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page, and continued use of our website constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Section 9: Contact Us */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">9. Contact Us</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              For questions or concerns about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:info@brightfutureschool.edu"
                className="text-[#0F5EF6] hover:underline transition-colors duration-300"
              >
                info@brightfutureschool.edu
              </a>{" "}
              or call (123) 456-7890.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <NavLink
            to="/"
            className="inline-block bg-[#0F5EF6] text-white py-2 px-6 rounded-md hover:bg-[#0b4cd1] transition-colors duration-300 text-sm font-medium"
          >
            Back to Home
          </NavLink>
        </div>
      </div>

      {/* Custom Animation Keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default PrivacyPolicy;