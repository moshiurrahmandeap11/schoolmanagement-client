import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheck, FaSave, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const MigrateStatus = ({ onBack }) => {
    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        status: ''
    });
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'inactive', label: 'Inactive', color: 'red' },
        { value: 'admission_pending', label: 'Admission Pending', color: 'yellow' },
        { value: 'admission_rejected', label: 'Admission Rejected', color: 'red' },
        { value: 'expelled', label: 'Expelled', color: 'red' },
        { value: 'moved', label: 'Moved To another Institute', color: 'blue' }
    ];

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (formData.classId) {
            fetchStudentsByFilters();
        } else {
            setStudents([]);
            setSelectedStudents([]);
        }
    }, [formData.classId, formData.batchId, formData.sectionId, formData.sessionId]);

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

    const fetchStudentsByFilters = async () => {
        if (!formData.classId) return;
        
        try {
            setFetchingStudents(true);
            
            const params = new URLSearchParams();
            params.append('classId', formData.classId);
            if (formData.batchId) params.append('batchId', formData.batchId);
            if (formData.sectionId) params.append('sectionId', formData.sectionId);
            if (formData.sessionId) params.append('sessionId', formData.sessionId);

            const response = await axiosInstance.get(`/migrate-status/students?${params}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
                setSelectedStudents([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            // Show more detailed error message
            const errorMessage = error.response?.data?.message || 'শিক্ষার্থীদের লোড করতে সমস্যা হয়েছে';
            showSweetAlert('error', errorMessage);
            setStudents([]);
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(student => student._id));
        }
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.color : 'gray';
    };

    const getStatusLabel = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.label : status;
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }
        
        if (!formData.status) {
            newErrors.status = 'অবস্থান নির্বাচন করুন';
        }
        
        if (selectedStudents.length === 0) {
            newErrors.students = 'কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন';
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
            const response = await axiosInstance.post('/migrate-status', {
                classId: formData.classId,
                batchId: formData.batchId || null,
                sectionId: formData.sectionId || null,
                sessionId: formData.sessionId || null,
                status: formData.status,
                studentIds: selectedStudents
            });

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                
                // Reset form
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    status: ''
                });
                setSelectedStudents([]);
                setStudents([]);
            } else {
                setErrors({ submit: response.data.message });
            }
            
        } catch (error) {
            console.error('Error updating student status:', error);
            const errorMessage = error.response?.data?.message || 'শিক্ষার্থীদের অবস্থান আপডেট করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                            শিক্ষার্থীদের অবস্থান পরিবর্তন
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
                                    শিক্ষার্থীদের অবস্থান পরিবর্তন:
                                </h3>
                            </div>

                            {/* Filters Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.classId ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                                    {errors.classId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.classId}</p>
                                    )}
                                </div>

                                {/* Batch */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ব্যাচ
                                    </label>
                                    <select
                                        name="batchId"
                                        value={formData.batchId}
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
                                        name="sectionId"
                                        value={formData.sectionId}
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
                                        name="sessionId"
                                        value={formData.sessionId}
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

                            {/* Status Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        অবস্থান *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">অবস্থান নির্বাচন করুন</option>
                                        {statusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && (
                                        <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                {/* Selected Status Preview */}
                                {formData.status && (
                                    <div className="flex items-center">
                                        <div className="mt-6">
                                            <span className="text-sm font-medium text-gray-700 mr-3">
                                                নির্বাচিত অবস্থান:
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(formData.status)}-100 text-${getStatusColor(formData.status)}-800`}>
                                                {getStatusLabel(formData.status)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Students Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        শিক্ষার্থীদের নির্বাচন করুন *
                                        {formData.classId && (
                                            <span className="text-gray-500 ml-2">
                                                ({students.length} জন শিক্ষার্থী)
                                            </span>
                                        )}
                                    </label>
                                    {formData.classId && students.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={selectAllStudents}
                                            className="text-sm text-[#1e90c9] font-medium"
                                        >
                                            {selectedStudents.length === students.length ? 
                                                'সব নির্বাচন করুন' : 'সব নির্বাচন করুন'
                                            }
                                        </button>
                                    )}
                                </div>

                                {errors.students && (
                                    <p className="text-sm text-red-600 mb-3">{errors.students}</p>
                                )}

                                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {!formData.classId ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaUser className="text-4xl text-gray-300 mx-auto mb-2" />
                                            <p>ক্লাস নির্বাচন করুন</p>
                                        </div>
                                    ) : fetchingStudents ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                            <p className="text-gray-600 mt-2">শিক্ষার্থী লোড হচ্ছে...</p>
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaUser className="text-4xl text-gray-300 mx-auto mb-2" />
                                            <p>এই ফিল্টারে কোন শিক্ষার্থী নেই</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {students.map((student) => (
                                                <div
                                                    key={student._id}
                                                    onClick={() => handleStudentSelection(student._id)}
                                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                        selectedStudents.includes(student._id)
                                                            ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                selectedStudents.includes(student._id)
                                                                    ? 'bg-purple-100 text-purple-600'
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                {student.photo ? (
                                                                    <img 
                                                                        src={student.photo} 
                                                                        alt={student.name}
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <FaUser className="text-sm" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-800">
                                                                    {student.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    ID: {student.studentId} | রোল: {student.classRoll}
                                                                </p>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 bg-${getStatusColor(student.status)}-100 text-${getStatusColor(student.status)}-800`}>
                                                                    {getStatusLabel(student.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded border ${
                                                            selectedStudents.includes(student._id)
                                                                ? 'bg-purple-500 border-purple-500'
                                                                : 'bg-white border-gray-300'
                                                        }`}>
                                                            {selectedStudents.includes(student._id) && (
                                                                <FaCheck className="text-white text-xs m-auto" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {formData.classId && students.length > 0 && (
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
                                            সংরক্ষণ হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {selectedStudents.length} জনের অবস্থান সংরক্ষণ করুন
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-[#1e90c9] mb-1">
                                অবস্থান পরিবর্তন সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-[#1e90c9] space-y-1">
                                <li>• Active: সক্রিয় শিক্ষার্থী</li>
                                <li>• Inactive: নিষ্ক্রিয় শিক্ষার্থী</li>
                                <li>• Admission Pending: ভর্তি প্রক্রিয়াধীন</li>
                                <li>• Admission Rejected: ভর্তি বাতিল</li>
                                <li>• Expelled: বহিষ্কৃত</li>
                                <li>• Moved To another Institute: অন্য প্রতিষ্ঠানে স্থানান্তরিত</li>
                                <li>• একসাথে একাধিক শিক্ষার্থীর অবস্থান পরিবর্তন করা যাবে</li>
                                <li>• অবস্থান পরিবর্তনের ইতিহাস সংরক্ষিত হবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MigrateStatus;