import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSms, FaSync, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const StudentsClassUpdate = ({ onBack }) => {
    const [formData, setFormData] = useState({
        currentClass: '',
        batch: '',
        section: '',
        activeSession: '',
        monthlyFeeFrom: '',
        sendAttendanceSMS: false,
        migrateTo: '',
        nextSession: '',
        nextClass: '',
        nextBatch: '',
        nextSection: ''
    });
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (formData.currentClass) {
            filterStudentsByClass();
        }
    }, [formData.currentClass]);

    const fetchDropdownData = async () => {
        try {
            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch batches
            const batchesResponse = await axiosInstance.get('/batches');
            if (batchesResponse.data.success) {
                setBatches(batchesResponse.data.data || []);
            }

            // Fetch sections
            const sectionsResponse = await axiosInstance.get('/sections');
            if (sectionsResponse.data.success) {
                setSections(sectionsResponse.data.data || []);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/students');
            
            if (response.data.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থীদের লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const filterStudentsByClass = () => {
        if (!formData.currentClass) {
            setSelectedStudents([]);
            return;
        }
        
        const filteredStudents = students.filter(student => 
            student.class?._id === formData.currentClass
        );
        setSelectedStudents(filteredStudents.map(student => student._id));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleStudentSelection = (studentId) => {
        setSelectedStudents(prev => {
            const isSelected = prev.includes(studentId);
            if (isSelected) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const selectAllStudents = () => {
        if (formData.currentClass) {
            const classStudents = students.filter(student => 
                student.class?._id === formData.currentClass
            );
            
            if (selectedStudents.length === classStudents.length) {
                setSelectedStudents([]);
            } else {
                setSelectedStudents(classStudents.map(student => student._id));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentClass) {
            newErrors.currentClass = 'বর্তমান ক্লাস নির্বাচন করুন';
        }
        
        if (selectedStudents.length === 0) {
            newErrors.students = 'কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন';
        }

        if (formData.migrateTo && (!formData.nextSession || !formData.nextClass)) {
            newErrors.migration = 'মাইগ্রেশন এর জন্য পরবর্তী সেশন এবং ক্লাস নির্বাচন করুন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const updatePromises = selectedStudents.map(async (studentId) => {
                const student = students.find(s => s._id === studentId);
                if (!student) return null;

                const updateData = {
                    // Current academic info
                    classId: formData.currentClass,
                    batchId: formData.batch || student.batch?._id,
                    sectionId: formData.section || student.section?._id,
                    sessionId: formData.activeSession || student.session?._id,
                    
                    // Additional settings
                    sendAttendanceSMS: formData.sendAttendanceSMS,
                    updatedAt: new Date()
                };

                // If migration is enabled, update next academic info
                if (formData.migrateTo === 'promote') {
                    updateData.nextSessionId = formData.nextSession;
                    updateData.nextClassId = formData.nextClass;
                    updateData.nextBatchId = formData.nextBatch;
                    updateData.nextSectionId = formData.nextSection;
                }

                // Update monthly fee if provided
                if (formData.monthlyFeeFrom) {
                    updateData.monthlyFeeFrom = formData.monthlyFeeFrom;
                }

                return axiosInstance.put(`/students/${studentId}`, updateData);
            });

            const results = await Promise.all(updatePromises);
            const successfulUpdates = results.filter(result => result?.data?.success);

            showSweetAlert(
                'success', 
                `${successfulUpdates.length} জন শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে`
            );

            // Reset form
            setFormData({
                currentClass: '',
                batch: '',
                section: '',
                activeSession: '',
                monthlyFeeFrom: '',
                sendAttendanceSMS: false,
                migrateTo: '',
                nextSession: '',
                nextClass: '',
                nextBatch: '',
                nextSection: ''
            });
            setSelectedStudents([]);
            
        } catch (error) {
            console.error('Error updating students:', error);
            const errorMessage = error.response?.data?.message || 'শিক্ষার্থীদের আপডেট করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedClassStudents = () => {
        if (!formData.currentClass) return [];
        return students.filter(student => student.class?._id === formData.currentClass);
    };

    const classStudents = getSelectedClassStudents();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষার্থীদের ক্লাস আপডেট
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-[#1e90c9] mb-2">
                                    শিক্ষার্থীদের একাডেমিক তথ্য আপডেট:
                                </h3>
                            </div>

                            {/* Current Academic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Current Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="currentClass"
                                        value={formData.currentClass}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.currentClass ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.currentClass && (
                                        <p className="mt-2 text-sm text-red-600">{errors.currentClass}</p>
                                    )}
                                </div>

                                {/* Batch */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ব্যাচ
                                    </label>
                                    <select
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">ব্যাচ নির্বাচন করুন</option>
                                        {batches.map((batch) => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেকশন
                                    </label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections.map((section) => (
                                            <option key={section._id} value={section._id}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Active Session
                                    </label>
                                    <select
                                        name="activeSession"
                                        value={formData.activeSession}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Additional Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Fee From
                                    </label>
                                    <input
                                        type="date"
                                        name="monthlyFeeFrom"
                                        value={formData.monthlyFeeFrom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="sendAttendanceSMS"
                                        checked={formData.sendAttendanceSMS}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                        disabled={loading}
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FaSms className="text-green-600" />
                                        Send Attendance SMS
                                    </label>
                                </div>
                            </div>

                            {/* Migration Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    পরবর্তী সেশনের জন্য মাইগ্রেশন
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Migrate To
                                        </label>
                                        <select
                                            name="migrateTo"
                                            value={formData.migrateTo}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                            disabled={loading}
                                        >
                                            <option value="">মাইগ্রেশন টাইপ নির্বাচন করুন</option>
                                            <option value="promote">পরবর্তী ক্লাসে প্রমোশন</option>
                                            <option value="same">একই ক্লাসে থাকবে</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.migrateTo === 'promote' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Next Session *
                                            </label>
                                            <select
                                                name="nextSession"
                                                value={formData.nextSession}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={loading}
                                            >
                                                <option value="">সেশন নির্বাচন করুন</option>
                                                {sessions.map((session) => (
                                                    <option key={session._id} value={session._id}>
                                                        {session.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Next Class *
                                            </label>
                                            <select
                                                name="nextClass"
                                                value={formData.nextClass}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={loading}
                                            >
                                                <option value="">ক্লাস নির্বাচন করুন</option>
                                                {classes.map((classItem) => (
                                                    <option key={classItem._id} value={classItem._id}>
                                                        {classItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Next Batch
                                            </label>
                                            <select
                                                name="nextBatch"
                                                value={formData.nextBatch}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={loading}
                                            >
                                                <option value="">ব্যাচ নির্বাচন করুন</option>
                                                {batches.map((batch) => (
                                                    <option key={batch._id} value={batch._id}>
                                                        {batch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Next Section
                                            </label>
                                            <select
                                                name="nextSection"
                                                value={formData.nextSection}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={loading}
                                            >
                                                <option value="">সেকশন নির্বাচন করুন</option>
                                                {sections.map((section) => (
                                                    <option key={section._id} value={section._id}>
                                                        {section.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {errors.migration && (
                                    <p className="mt-2 text-sm text-red-600">{errors.migration}</p>
                                )}
                            </div>

                            {/* Students Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        শিক্ষার্থীদের নির্বাচন করুন *
                                        <span className="text-gray-500 ml-2">
                                            ({classStudents.length} জন শিক্ষার্থী)
                                        </span>
                                    </label>
                                    {formData.currentClass && (
                                        <button
                                            type="button"
                                            onClick={selectAllStudents}
                                            className="text-sm text-[#1e90c9] font-medium"
                                        >
                                            {selectedStudents.length === classStudents.length ? 
                                                'সব নির্বাচন করুন' : 'সব নির্বাচন করুন'
                                            }
                                        </button>
                                    )}
                                </div>

                                {errors.students && (
                                    <p className="text-sm text-red-600 mb-3">{errors.students}</p>
                                )}

                                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {!formData.currentClass ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaUser className="text-4xl text-gray-300 mx-auto mb-2" />
                                            <p>ক্লাস নির্বাচন করুন</p>
                                        </div>
                                    ) : classStudents.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaUser className="text-4xl text-gray-300 mx-auto mb-2" />
                                            <p>এই ক্লাসে কোন শিক্ষার্থী নেই</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {classStudents.map((student) => (
                                                <div
                                                    key={student._id}
                                                    onClick={() => handleStudentSelection(student._id)}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                        selectedStudents.includes(student._id)
                                                            ? 'bg-green-50 border-green-300'
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                selectedStudents.includes(student._id)
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <FaUser className="text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-800">
                                                                    {student.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    ID: {student.studentId} | রোল: {student.classRoll}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded border ${
                                                            selectedStudents.includes(student._id)
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'bg-white border-gray-300'
                                                        }`}>
                                                            {selectedStudents.includes(student._id) && (
                                                                <div className="w-2 h-2 bg-white rounded-sm m-auto mt-0.5"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {formData.currentClass && classStudents.length > 0 && (
                                    <div className="mt-3 text-sm text-gray-600">
                                        নির্বাচিত শিক্ষার্থী: {selectedStudents.length} জন
                                    </div>
                                )}
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    বাতিল করুন
                                </button>
                                <MainButton
                                    type="submit"
                                    disabled={loading || selectedStudents.length === 0}
                                    className="rounded-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            আপডেট হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSync className="text-sm mr-2" />
                                            {selectedStudents.length} জন শিক্ষার্থী আপডেট করুন
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-[#1e90c9] mb-1">
                                ক্লাস আপডেট সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-[#1e90c9] space-y-1">
                                <li>• একসাথে একাধিক শিক্ষার্থীর একাডেমিক তথ্য আপডেট করতে পারবেন</li>
                                <li>• মাইগ্রেশন ফিচার ব্যবহার করে পরবর্তী সেশনের জন্য প্রস্তুত করতে পারবেন</li>
                                <li>• Monthly Fee From তারিখ সেট করলে ফি ক্যালকুলেশন সেই তারিখ থেকে শুরু হবে</li>
                                <li>• Send Attendance SMS চালু করলে অটোমেটিক attendance SMS যাবে</li>
                                <li>• নির্বাচিত সব শিক্ষার্থী একই সাথে আপডেট হবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsClassUpdate;