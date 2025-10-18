import React from 'react';

const About = () => {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About Our School
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our school is committed to providing a nurturing and inspiring environment
            where students can excel academically, socially, and personally.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <img
              className="rounded-lg shadow-lg w-full max-w-md"
              src="https://i.postimg.cc/Nfh5p3pW/360-F-1512041110-c0-NFJDc-HLm-UJiwf-Dowzc-KUgs-PALmbjd-D.jpg"
              alt="School building"
            />
          </div>

          {/* Text */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">Our Mission</h3>
            <p className="text-gray-600">
              We aim to empower students with knowledge, skills, and values
              to become responsible global citizens. We focus on holistic
              development including academics, arts, sports, and leadership.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800">Our Vision</h3>
            <p className="text-gray-600">
              To be recognized as a leading institution where learning is
              innovative, inclusive, and inspiring. We nurture curiosity,
              creativity, and a lifelong love for learning.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800">Why Choose Us?</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced and passionate teachers</li>
              <li>Modern classrooms and labs</li>
              <li>Rich extracurricular activities</li>
              <li>Strong focus on values and discipline</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
