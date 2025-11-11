import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheck, FaCodeBranch, FaSave, FaSms, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const MigrateBranch = ({ onBack }) => {
    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        monthlyFeeFrom: '',
        sendAttendanceSMS: false,
        migrateTo: '',
        branchId: ''
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
    const [branches, setBranches] = useState([]);

    // Migration options
    const migrateOptions = [
        { value: 'madrasha', label: 'মাদ্রাসা' },
        { value: 'college', label: 'কলেজ' },
        { value: 'school', label: 'স্কুল' }
    ];

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (formData.classId) {
            fetchStudentsByClass();
        } else {
            setStudents([]);
            setSelectedStudents([]);
        }
    }, [formData.classId, formData.batchId, formData.sectionId]);

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

            // Fetch branches
            const branchesResponse = await axiosInstance.get('/branches');
            if (branchesResponse.data.success) {
                setBranches(branchesResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchStudentsByClass = async () => {
        if (!formData.classId) return;
        
        try {
            setFetchingStudents(true);
            
            const params = new URLSearchParams();
            params.append('classId', formData.classId);
            if (formData.batchId) params.append('batchId', formData.batchId);
            if (formData.sectionId) params.append('sectionId', formData.sectionId);

            const response = await axiosInstance.get(`/students?${params}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
                setSelectedStudents([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থীদের লোড করতে সমস্যা হয়েছে');
        } finally {
            setFetchingStudents(false);
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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }
        
        if (!formData.migrateTo) {
            newErrors.migrateTo = 'মাইগ্রেশন টাইপ নির্বাচন করুন';
        }

        if (!formData.branchId) {
            newErrors.branchId = 'ব্রাঞ্চ নির্বাচন করুন';
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
            const response = await axiosInstance.post('/migrate-branches', {
                classId: formData.classId,
                batchId: formData.batchId || null,
                sectionId: formData.sectionId || null,
                monthlyFeeFrom: formData.monthlyFeeFrom || null,
                sendAttendanceSMS: formData.sendAttendanceSMS,
                migrateTo: formData.migrateTo,
                branchId: formData.branchId,
                studentIds: selectedStudents
            });

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                
                // Reset form
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    monthlyFeeFrom: '',
                    sendAttendanceSMS: false,
                    migrateTo: '',
                    branchId: ''
                });
                setSelectedStudents([]);
                setStudents([]);
            } else {
                setErrors({ submit: response.data.message });
            }
            
        } catch (error) {
            console.error('Error migrating branch:', error);
            const errorMessage = error.response?.data?.message || 'ব্রাঞ্চ মাইগ্রেশন করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedBranchName = () => {
        const branch = branches.find(b => b._id === formData.branchId);
        return branch ? branch.name : '';
    };

    const getMigrateToLabel = () => {
        const option = migrateOptions.find(opt => opt.value === formData.migrateTo);
        return option ? option.label : '';
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
                            ব্রাঞ্চ মাইগ্রেশন
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                                    ব্রাঞ্চ মাইগ্রেশন:
                                </h3>
                                <p className="text-sm text-indigo-600">
                                    শিক্ষার্থীদের অন্য ব্রাঞ্চে স্থানান্তর করুন
                                </p>
                            </div>

                            {/* Academic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

                            {/* Migration Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly fee from madrasha/college
                                    </label>
                                    <input
                                        type="date"
                                        name="monthlyFeeFrom"
                                        value={formData.monthlyFeeFrom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="sendAttendanceSMS"
                                        checked={formData.sendAttendanceSMS}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                        disabled={loading}
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FaSms className="text-indigo-600" />
                                        Send attendance SMS
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Migrate To *
                                    </label>
                                    <select
                                        name="migrateTo"
                                        value={formData.migrateTo}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                            errors.migrateTo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">মাইগ্রেশন টাইপ নির্বাচন করুন</option>
                                        {migrateOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.migrateTo && (
                                        <p className="mt-2 text-sm text-red-600">{errors.migrateTo}</p>
                                    )}
                                </div>
                            </div>

                            {/* Branch Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch *
                                </label>
                                <select
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                        errors.branchId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">ব্রাঞ্চ নির্বাচন করুন</option>
                                    {branches.map((branch) => (
                                        <option key={branch._id} value={branch._id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.branchId && (
                                    <p className="mt-2 text-sm text-red-600">{errors.branchId}</p>
                                )}
                            </div>

                            {/* Selected Options Preview */}
                            {(formData.migrateTo || formData.branchId) && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                    <h4 className="text-sm font-medium text-indigo-800 mb-2">
                                        নির্বাচিত অপশনসমূহ:
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {formData.migrateTo && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                <FaCodeBranch className="mr-1" />
                                                মাইগ্রেশন: {getMigrateToLabel()}
                                            </span>
                                        )}
                                        {formData.branchId && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ব্রাঞ্চ: {getSelectedBranchName()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            {selectedStudents.length === students.length ? 
                                                'সব নির্বাচন解除 করুন' : 'সব নির্বাচন করুন'
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
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
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
                                                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                selectedStudents.includes(student._id)
                                                                    ? 'bg-indigo-100 text-indigo-600'
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
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded border ${
                                                            selectedStudents.includes(student._id)
                                                                ? 'bg-indigo-500 border-indigo-500'
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
                                <button
                                    type="submit"
                                    disabled={loading || selectedStudents.length === 0}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            মাইগ্রেট হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {selectedStudents.length} জন মাইগ্রেট করুন
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <h3 className="text-sm font-medium text-indigo-800 mb-1">
                                ব্রাঞ্চ মাইগ্রেশন সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-indigo-600 space-y-1">
                                <li>• শিক্ষার্থীদের অন্য ব্রাঞ্চে স্থানান্তর করার জন্য এই ফিচার ব্যবহার করুন</li>
                                <li>• Monthly fee from তারিখ সেট করলে নতুন ব্রাঞ্চে ফি সেই তারিখ থেকে গণনা হবে</li>
                                <li>• Send attendance SMS চালু করলে attendance SMS অটোমেটিক যাবে</li>
                                <li>• মাইগ্রেশন টাইপ নির্বাচন করুন (মাদ্রাসা/কলেজ/স্কুল)</li>
                                <li>• টার্গেট ব্রাঞ্চ নির্বাচন করুন</li>
                                <li>• একসাথে একাধিক শিক্ষার্থী মাইগ্রেট করা যাবে</li>
                                <li>• সমস্ত মাইগ্রেশন রেকর্ড সংরক্ষিত হবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MigrateBranch;