const AcademicInformation = ({
  formData,
  errors,
  classes = [],
  sections = [],
  batches = [],
  sessions = [],
  teachers = [],
  onChange,
}) => {
  const studentTypes = [
    { value: "non_residential", label: "Non Residential" },
    { value: "residential", label: "Residential" },
    { value: "day_care", label: "Day Care" },
    { value: "boarding", label: "Boarding" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "admission_pending", label: "Admission Pending" },
    { value: "admission_rejected", label: "Admission Rejected" },
    { value: "expelled", label: "Expelled" },
    { value: "moved", label: "Moved to another Institute" },
  ];

  // Debug: Check if data is available
  console.log('Classes:', classes);
  console.log('Sections:', sections);
  console.log('Batches:', batches);
  console.log('Sessions:', sessions);
  console.log('Teachers:', teachers);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Class */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          ক্লাস <span className="text-red-500">*</span>
        </label>
        <select
          name="classId"
          value={formData.classId}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.classId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">ক্লাস নির্বাচন করুন</option>
          {classes && classes.length > 0 ? (
            classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))
          ) : (
            <option value="" disabled>কোন ক্লাস পাওয়া যায়নি</option>
          )}
        </select>
        {errors.classId && (
          <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
        )}
        {/* Debug Info */}
        <p className="text-xs text-gray-500 mt-1">
          {classes.length} টি ক্লাস পাওয়া গেছে
        </p>
      </div>

      {/* Batch */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          ব্যাচ
        </label>
        <select
          name="batchId"
          value={formData.batchId}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">ব্যাচ নির্বাচন করুন</option>
          {batches && batches.length > 0 ? (
            batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))
          ) : (
            <option value="" disabled>কোন ব্যাচ পাওয়া যায়নি</option>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {batches.length} টি ব্যাচ পাওয়া গেছে
        </p>
      </div>

      {/* Section */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          সেকশন
        </label>
        <select
          name="sectionId"
          value={formData.sectionId}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">সেকশন নির্বাচন করুন</option>
          {sections && sections.length > 0 ? (
            sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))
          ) : (
            <option value="" disabled>কোন সেকশন পাওয়া যায়নি</option>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {sections.length} টি সেকশন পাওয়া গেছে
        </p>
      </div>

      {/* Active Session */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Active Session
        </label>
        <select
          name="sessionId"
          value={formData.sessionId}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">সেশন নির্বাচন করুন</option>
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))
          ) : (
            <option value="" disabled>কোন সেশন পাওয়া যায়নি</option>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {sessions.length} টি সেশন পাওয়া গেছে
        </p>
      </div>

      {/* Student Class Roll */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Student Class Roll <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="classRoll"
          value={formData.classRoll}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.classRoll ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="ক্লাস রোল"
          min="1"
        />
        {errors.classRoll && (
          <p className="text-red-500 text-xs mt-1">{errors.classRoll}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          অবস্থান
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Student Type */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Student Type
        </label>
        <select
          name="studentType"
          value={formData.studentType}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {studentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Academic Mentor */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Academic Mentor
        </label>
        <select
          name="mentorId"
          value={formData.mentorId}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">শিক্ষক নির্বাচন করুন</option>
          {teachers && teachers.length > 0 ? (
            teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))
          ) : (
            <option value="" disabled>কোন শিক্ষক পাওয়া যায়নি</option>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {teachers.length} জন শিক্ষক পাওয়া গেছে
        </p>
      </div>

      {/* Additional Note */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Additional Note
        </label>
        <textarea
          name="additionalNote"
          value={formData.additionalNote}
          onChange={onChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          placeholder="অতিরিক্ত নোট"
        />
      </div>
    </div>
  );
};

export default AcademicInformation;