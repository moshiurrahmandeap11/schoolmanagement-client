import React from 'react';

const Author = () => {
  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Meet Our Founder
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Our founder is dedicated to providing quality education and nurturing the next generation of leaders.
        </p>

        {/* Author Card */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              className="w-48 h-48 rounded-full object-cover shadow-lg mx-auto"
              src="https://i.postimg.cc/WbnTgCKM/Founder-vs-CEO-Whats-the-Difference.png"
              alt="Founder"
            />
          </div>

          {/* Info */}
          <div className="max-w-xl text-center md:text-left space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800">Dr. John Doe</h3>
            <p className="text-gray-600 italic">Founder & Principal</p>
            <p className="text-gray-600">
              Dr. John Doe has over 20 years of experience in the field of education.
              His vision is to create an environment where students can thrive academically,
              socially, and personally. Passionate about innovation in teaching methods,
              he ensures that every student receives the best guidance and support.
            </p>

            <div className="flex justify-center md:justify-start gap-4 mt-4">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Author;
