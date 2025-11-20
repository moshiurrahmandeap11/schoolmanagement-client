import { useEffect, useState } from 'react';
import { FaCheck, FaSave, FaTimes, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';


const DividePathokrom = ({ onBack }) => {
    const [formData, setFormData] = useState({
        className: '',
        sectionName: '',
        subjectName: '',
        isOptional: false,
        isExtraSubject: false,
        extraSubjectsNote: ''
    });
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (formData.className && formData.sectionName) {
            fetchStudents();
        }
    }, [formData.className, formData.sectionName]);

    const fetchDropdownData = async () => {
        try {
            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch sections
            const sectionsResponse = await axiosInstance.get('/sections');
            if (sectionsResponse.data.success) {
                setSections(sectionsResponse.data.data || []);
            }

            // Fetch subjects
            const subjectsResponse = await axiosInstance.get('/subjects');
            if (subjectsResponse.data.success) {
                setSubjects(subjectsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/students?class=${formData.className}&section=${formData.sectionName}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
                setSelectedStudents([]); // Reset selected students when class/section changes
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থীদের লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
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

    const handleStudentSelection = (student) => {
        setSelectedStudents(prev => {
            const isSelected = prev.some(s => s.studentId === student._id);
            if (isSelected) {
                return prev.filter(s => s.studentId !== student._id);
            } else {
                return [...prev, {
                    studentId: student._id,
                    studentName: student.name,
                    rollNumber: student.rollNumber
                }];
            }
        });
    };

    const selectAllStudents = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(student => ({
                studentId: student._id,
                studentName: student.name,
                rollNumber: student.rollNumber
            })));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.className.trim()) {
            newErrors.className = 'ক্লাস নির্বাচন করুন';
        }
        
        if (!formData.sectionName.trim()) {
            newErrors.sectionName = 'সেকশন নির্বাচন করুন';
        }

        if (!formData.subjectName.trim()) {
            newErrors.subjectName = 'বিষয় নির্বাচন করুন';
        }

        if (selectedStudents.length === 0) {
            newErrors.students = 'কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন';
        }

        if (formData.isExtraSubject && !formData.extraSubjectsNote.trim()) {
            newErrors.extraSubjectsNote = 'এক্সট্রা সাবজেক্টের বিবরণ দিন';
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
            const response = await axiosInstance.post('/divide-pathokrom', {
                className: formData.className,
                sectionName: formData.sectionName,
                subjectName: formData.subjectName,
                isOptional: formData.isOptional,
                isExtraSubject: formData.isExtraSubject,
                extraSubjectsNote: formData.extraSubjectsNote,
                selectedStudents: selectedStudents
            });

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                // Reset form
                setFormData({
                    className: '',
                    sectionName: '',
                    subjectName: '',
                    isOptional: false,
                    isExtraSubject: false,
                    extraSubjectsNote: ''
                });
                setSelectedStudents([]);
                setStudents([]);
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error dividing pathokrom:', error);
            const errorMessage = error.response?.data?.message || 'পাঠক্রম বিভাজন করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-[#1e90c9] mb-2">
                                    পাঠক্রম বিভাজনের তথ্য:
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Class Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.className ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem._id} value={classItem.name}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.className && (
                                        <p className="mt-2 text-sm text-red-600">{errors.className}</p>
                                    )}
                                </div>

                                {/* Section Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেকশন *
                                    </label>
                                    <select
                                        name="sectionName"
                                        value={formData.sectionName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.sectionName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections.map((section) => (
                                            <option key={section._id} value={section.name}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sectionName && (
                                        <p className="mt-2 text-sm text-red-600">{errors.sectionName}</p>
                                    )}
                                </div>

                                {/* Subject Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বিষয় *
                                    </label>
                                    <select
                                        name="subjectName"
                                        value={formData.subjectName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.subjectName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">বিষয় নির্বাচন করুন</option>
                                        {subjects.map((subject) => (
                                            <option key={subject._id} value={subject.name}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subjectName && (
                                        <p className="mt-2 text-sm text-red-600">{errors.subjectName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isOptional"
                                        checked={formData.isOptional}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                        disabled={loading}
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        ঐচ্ছিক বিষয়
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isExtraSubject"
                                        checked={formData.isExtraSubject}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-[#1e90c9]"
                                        disabled={loading}
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        এক্সট্রা সাবজেক্ট
                                    </label>
                                </div>
                            </div>

                            {/* Extra Subjects Note */}
                            {formData.isExtraSubject && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        এক্সট্রা সাবজেক্টের বিবরণ *
                                        <span className="text-xs text-gray-500 ml-2">
                                            (এই বিষয়গুলি GPA ক্যালকুলেশনে যোগ হবে না)
                                        </span>
                                    </label>
                                    <textarea
                                        name="extraSubjectsNote"
                                        value={formData.extraSubjectsNote}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.extraSubjectsNote ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="এক্সট্রা সাবজেক্ট সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                                        disabled={loading}
                                    />
                                    {errors.extraSubjectsNote && (
                                        <p className="mt-2 text-sm text-red-600">{errors.extraSubjectsNote}</p>
                                    )}
                                </div>
                            )}

                            {/* Students Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        শিক্ষার্থীদের নির্বাচন করুন *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={selectAllStudents}
                                        className="text-sm text-[#1e90c9] font-medium"
                                    >
                                        {selectedStudents.length === students.length ? 'সব নির্বাচন করুন' : 'সব নির্বাচন করুন'}
                                    </button>
                                </div>

                                {errors.students && (
                                    <p className="text-sm text-red-600 mb-3">{errors.students}</p>
                                )}

                                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e90c9] mx-auto"></div>
                                            <p className="text-gray-600 mt-2">শিক্ষার্থী লোড হচ্ছে...</p>
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaUser className="text-4xl text-gray-300 mx-auto mb-2" />
                                            <p>কোন শিক্ষার্থী পাওয়া যায়নি</p>
                                            <p className="text-sm">ক্লাস এবং সেকশন নির্বাচন করুন</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {students.map((student) => (
                                                <div
                                                    key={student._id}
                                                    onClick={() => handleStudentSelection(student)}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                        selectedStudents.some(s => s.studentId === student._id)
                                                            ? 'bg-blue-50 border-blue-300'
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                selectedStudents.some(s => s.studentId === student._id)
                                                                    ? 'bg-blue-100 text-[#1e90c9]'
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <FaUser className="text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-800">
                                                                    {student.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    রোল: {student.rollNumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {selectedStudents.some(s => s.studentId === student._id) ? (
                                                            <FaCheck className="text-green-500 text-sm" />
                                                        ) : (
                                                            <FaTimes className="text-gray-300 text-sm" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {students.length > 0 && (
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
                                    disabled={loading}
                                    className="rounded-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            সংরক্ষণ হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            পাঠক্রম সংরক্ষণ করুন
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-[#1e90c9] mb-1">
                                পাঠক্রম বিভাজন সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-[#1e90c9] space-y-1">
                                <li>• প্রতিটি বিষয়ের জন্য আলাদাভাবে শিক্ষার্থী নির্বাচন করুন</li>
                                <li>• একজন শিক্ষার্থী একটি ক্লাসে একই বিষয় একবারই নিতে পারবে</li>
                                <li>• ঐচ্ছিক বিষয়গুলি সাধারণ বিষয় থেকে আলাদা</li>
                                <li>• এক্সট্রা সাবজেক্ট GPA ক্যালকুলেশনে গণনা করা হবে না</li>
                                <li>• নির্বাচিত শিক্ষার্থীদের বিষয়ভিত্তিক গ্রুপ তৈরি হবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DividePathokrom;