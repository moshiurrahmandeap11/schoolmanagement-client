import React from "react";
import { NavLink } from "react-router";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-[#0F5EF6] mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to BrightFuture School. Please read our terms and conditions carefully.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">1. Introduction</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              These Terms and Conditions govern your use of the BrightFuture School website and services. By accessing or using our website, you agree to be bound by these terms. If you do not agree, please refrain from using our services.
            </p>
          </div>

          {/* Section 2: User Conduct */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">2. User Conduct</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Users are expected to use the website in a lawful and respectful manner. You agree not to post or transmit any content that is unlawful, harmful, or violates the rights of others. BrightFuture School reserves the right to suspend or terminate access for any user violating these terms.
            </p>
          </div>

          {/* Section 3: Enrollment and Payments */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">3. Enrollment and Payments</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Enrollment in our programs requires adherence to our payment policies. All fees must be paid on time as outlined in the enrollment agreement. Failure to make timely payments may result in suspension of access to school services.
            </p>
          </div>

          {/* Section 4: Intellectual Property */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              All content on this website, including text, images, and logos, is the property of BrightFuture School or its licensors and is protected by copyright laws. Unauthorized use or reproduction of any content is strictly prohibited.
            </p>
          </div>

          {/* Section 5: Privacy */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">5. Privacy</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your privacy is important to us. Please review our{" "}
              <NavLink
                to="/privacy"
                className="text-[#0F5EF6] hover:underline transition-colors duration-300"
              >
                Privacy Policy
              </NavLink>{" "}
              to understand how we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              BrightFuture School is not liable for any damages arising from the use or inability to use our website or services, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </div>

          {/* Section 7: Changes to Terms */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page, and continued use of the website constitutes acceptance of the updated terms.
            </p>
          </div>

          {/* Section 8: Contact Us */}
          <div className="bg-white shadow-md rounded-lg p-6 transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-[#0F5EF6] mb-4">8. Contact Us</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at{" "}
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

export default TermsAndConditions;