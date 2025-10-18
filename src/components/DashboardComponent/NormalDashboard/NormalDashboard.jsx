import React from "react";

const NormalDashboard = () => {
  // Dummy data
  const courses = [
    { id: 1, title: "Mathematics 101", progress: 80 },
    { id: 2, title: "Science Basics", progress: 65 },
    { id: 3, title: "History & Culture", progress: 90 },
  ];

  const notifications = [
    "New assignment uploaded in Mathematics 101",
    "Parent-teacher meeting scheduled on Friday",
    "School picnic on 20th October",
  ];

  return (
    <section className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Welcome Back, Student!
          </h1>
          <p className="text-gray-600 mt-2">
            Here’s a quick overview of your courses and notifications.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Courses Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your Courses
            </h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id}>
                  <p className="text-gray-700 font-medium">{course.title}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{course.progress}% completed</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Notifications
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {notifications.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>

          {/* Quick Links / Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-4">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Profile
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Enroll in Course
              </button>
              <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                Check Assignments
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NormalDashboard;
