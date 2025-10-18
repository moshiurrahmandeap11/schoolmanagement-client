import React from 'react';

const Results = () => {
  // Dummy data
  const results = [
    { id: 1, name: "Alice Smith", grade: "A+", marks: 95 },
    { id: 2, name: "Bob Johnson", grade: "A", marks: 90 },
    { id: 3, name: "Charlie Brown", grade: "B+", marks: 85 },
    { id: 4, name: "Daisy Ridley", grade: "A", marks: 92 },
    { id: 5, name: "Ethan Hunt", grade: "B", marks: 80 },
  ];

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Exam Results
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here are the latest results of our students. Congratulations to all for their hard work!
          </p>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Student Name</th>
                <th className="py-3 px-6 text-left">Grade</th>
                <th className="py-3 px-6 text-left">Marks</th>
              </tr>
            </thead>
            <tbody>
              {results.map((student, index) => (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="py-3 px-6">{index + 1}</td>
                  <td className="py-3 px-6">{student.name}</td>
                  <td className="py-3 px-6 font-semibold text-gray-800">{student.grade}</td>
                  <td className="py-3 px-6">{student.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="text-gray-500 text-sm mt-6 text-center">
          * This is a dummy results page. Actual results will be updated soon.
        </p>
      </div>
    </section>
  );
};

export default Results;
