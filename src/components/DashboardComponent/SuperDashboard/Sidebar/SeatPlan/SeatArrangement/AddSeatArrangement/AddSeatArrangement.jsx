import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewArrangement = ({ arrangement, onClose }) => {
    const [formData, setFormData] = useState({
        className: '',
        batch: '',
        section: '',
        activeSession: '',
        monthlyFee: '',
        sendAttendanceSMS: false,
        hallRoom: '',
        exam: '',
        examDuration: '',
        columnNumber: '',
        rowNumber: '',
        studentsPerBench: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Separate states for dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [examHalls, setExamHalls] = useState([]);
    const [exams, setExams] = useState([]);
    const [examTimetables, setExamTimetables] = useState([]);
    
    const [dropdownLoading, setDropdownLoading] = useState(true);

    // Fetch all dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setDropdownLoading(true);
                
                // Fetch all data in parallel
                const [
                    classesRes,
                    batchesRes, 
                    sectionsRes,
                    sessionsRes,
                    examHallsRes,
                    examsRes,
                    examTimetablesRes
                ] = await Promise.all([
                    axiosInstance.get('/class'),
                    axiosInstance.get('/batches'),
                    axiosInstance.get('/sections'),
                    axiosInstance.get('/sessions'),
                    axiosInstance.get('/exam-hall'),
                    axiosInstance.get('/exam-categories'),
                    axiosInstance.get('/exam-timetable')
                ]);

                // Set data from responses
                if (classesRes.data?.success) setClasses(classesRes.data.data || []);
                if (batchesRes.data?.success) setBatches(batchesRes.data.data || []);
                if (sectionsRes.data?.success) setSections(sectionsRes.data.data || []);
                if (sessionsRes.data?.success) setSessions(sessionsRes.data.data || []);
                if (examHallsRes.data?.success) setExamHalls(examHallsRes.data.data || []);
                if (examsRes.data?.success) setExams(examsRes.data.data || []);
                if (examTimetablesRes.data?.success) setExamTimetables(examTimetablesRes.data.data || []);

            } catch (err) {
                console.error('Error fetching dropdown data:', err);
                setError('ড্রপডাউন ডেটা লোড করতে সমস্যা হয়েছে');
            } finally {
                setDropdownLoading(false);
            }
        };

        fetchDropdownData();
    }, []);

    // Set form data if editing
    useEffect(() => {
        if (arrangement) {
            setFormData({
                className: arrangement.className || '',
                batch: arrangement.batch || '',
                section: arrangement.section || '',
                activeSession: arrangement.activeSession || '',
                monthlyFee: arrangement.monthlyFee || '',
                sendAttendanceSMS: arrangement.sendAttendanceSMS || false,
                hallRoom: arrangement.hallRoom || '',
                exam: arrangement.exam || '',
                examDuration: arrangement.examDuration || '',
                columnNumber: arrangement.columnNumber || '',
                rowNumber: arrangement.rowNumber || '',
                studentsPerBench: arrangement.studentsPerBench || ''
            });
        }
    }, [arrangement]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Calculate total seats
    const calculateTotalSeats = () => {
        const { columnNumber, rowNumber, studentsPerBench } = formData;
        if (columnNumber && rowNumber && studentsPerBench) {
            return parseInt(columnNumber) * parseInt(rowNumber) * parseInt(studentsPerBench);
        }
        return 0;
    };

    // Validate form
    const validateForm = () => {
        const requiredFields = [
            'className', 'batch', 'section', 'activeSession', 
            'hallRoom', 'exam', 'examDuration', 'columnNumber', 
            'rowNumber', 'studentsPerBench'
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                setError(`${field} আবশ্যক`);
                return false;
            }
        }

        if (calculateTotalSeats() === 0) {
            setError('কলাম, সারি এবং বেঞ্চ প্রতি ছাত্র সংখ্যা সঠিকভাবে দিন');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const url = arrangement ? `/seat-arrangement/${arrangement._id}` : '/seat-arrangement';
            const method = arrangement ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data && response.data.success) {
                setSuccess(arrangement ? 'আসল পরিকল্পনা সফলভাবে আপডেট হয়েছে' : 'আসল পরিকল্পনা সফলভাবে তৈরি হয়েছে');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.data?.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('সার্ভার সমস্যা হয়েছে');
            }
            console.error('Error saving seat arrangement:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalSeats = calculateTotalSeats();

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {arrangement ? 'আসল পরিকল্পনা এডিট করুন' : 'নতুন আসল পরিকল্পনা যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        {dropdownLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls.name}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Batch */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ব্যাচ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">ব্যাচ নির্বাচন করুন</option>
                                        {batches.map((batch) => (
                                            <option key={batch._id} value={batch.name}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেকশন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections.map((section) => (
                                            <option key={section._id} value={section.name}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Active Session <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="activeSession"
                                        value={formData.activeSession}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session.name}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Monthly Fee */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Fee From Madrasha / College
                                    </label>
                                    <input
                                        type="number"
                                        name="monthlyFee"
                                        value={formData.monthlyFee}
                                        onChange={handleInputChange}
                                        placeholder="মাসিক ফি"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                </div>

                                {/* Send Attendance SMS */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="sendAttendanceSMS"
                                        checked={formData.sendAttendanceSMS}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Send attendance SMS
                                    </label>
                                </div>

                                {/* Hall Room */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hall Room <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="hallRoom"
                                        value={formData.hallRoom}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">হল রুম নির্বাচন করুন</option>
                                        {examHalls.map((hall) => (
                                            <option key={hall._id} value={hall.name}>
                                                {hall.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Exam */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="exam"
                                        value={formData.exam}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">পরীক্ষা নির্বাচন করুন</option>
                                        {exams.map((exam) => (
                                            <option key={exam._id} value={exam.name}>
                                                {exam.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Exam Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Duration <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="examDuration"
                                        value={formData.examDuration}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">পরীক্ষার সময় নির্বাচন করুন</option>
                                        {examTimetables.map((timetable) => (
                                            <option key={timetable._id} value={timetable.duration}>
                                                {timetable.duration}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Column Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Column Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="columnNumber"
                                        value={formData.columnNumber}
                                        onChange={handleInputChange}
                                        placeholder="কলাম সংখ্যা"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>

                                {/* Row Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Row Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="rowNumber"
                                        value={formData.rowNumber}
                                        onChange={handleInputChange}
                                        placeholder="সারি সংখ্যা"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>

                                {/* Students per bench */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Students per bench <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="studentsPerBench"
                                        value={formData.studentsPerBench}
                                        onChange={handleInputChange}
                                        placeholder="বেঞ্চ প্রতি ছাত্র সংখ্যা"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Total Seats Calculation */}
                        {totalSeats > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-sm font-medium text-blue-800">
                                    মোট সিট সংখ্যা: {totalSeats} টি
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    ({formData.columnNumber} কলাম × {formData.rowNumber} সারি × {formData.studentsPerBench} ছাত্র/বেঞ্চ)
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={loading || dropdownLoading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading || dropdownLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{arrangement ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{arrangement ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewArrangement;