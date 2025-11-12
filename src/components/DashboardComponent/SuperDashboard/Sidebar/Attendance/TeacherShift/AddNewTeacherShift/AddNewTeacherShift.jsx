import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewTeacherShift = ({ onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        teacher: '',
        shiftName: '',
        teacherEntryTime: '',
        teacherExitTime: '',
        countLateAfter: '',
        countEarlyExitBefore: '',
        sendSms: false,
        smsType: '',
        timezone: 'Asia/Dhaka',
        absentAfter: ''
    });

    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axiosInstance.get('/teacher-list');
                if (response.data && response.data.success) {
                    setTeachers(response.data.data || []);
                }
            } catch (err) {
                setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching teachers:', err);
            }
        };

        fetchTeachers();
    }, []);

    // Handle teacher selection
    const handleTeacherChange = (e) => {
        const teacherId = e.target.value;
        setFormData(prev => ({ ...prev, teacher: teacherId }));
        
        // Find selected teacher data
        const teacher = teachers.find(t => t._id === teacherId);
        setSelectedTeacher(teacher);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.teacher) {
            setError('শিক্ষক নির্বাচন করুন');
            return;
        }

        if (!formData.shiftName.trim()) {
            setError('শিফটের নাম প্রয়োজন');
            return;
        }

        if (!formData.teacherEntryTime || !formData.teacherExitTime) {
            setError('এন্ট্রি এবং এক্সিট টাইম প্রয়োজন');
            return;
        }

        if (formData.sendSms && !formData.smsType) {
            setError('SMS টাইপ নির্বাচন করুন');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Prepare update data with existing teacher info
            const updateData = {
                // Existing teacher data (required fields)
                name: selectedTeacher.name,
                mobile: selectedTeacher.mobile,
                designation: selectedTeacher.designation || '',
                salary: selectedTeacher.salary || '',
                position: selectedTeacher.position || 'Active',
                session: selectedTeacher.session || '',
                staffType: selectedTeacher.staffType || 'Teacher',
                // New shift data
                shiftName: formData.shiftName.trim(),
                teacherEntryTime: formData.teacherEntryTime,
                teacherExitTime: formData.teacherExitTime,
                countLateAfter: formData.countLateAfter || '',
                countEarlyExitBefore: formData.countEarlyExitBefore || '',
                sendSms: formData.sendSms || false,
                smsType: formData.sendSms ? formData.smsType : '',
                timezone: formData.timezone || 'Asia/Dhaka',
                absentAfter: formData.absentAfter || ''
            };

            // Update teacher with shift data
            const response = await axiosInstance.put(`/teacher-list/${formData.teacher}`, updateData);

            if (response.data && response.data.success) {
                setSuccess('শিক্ষক শিফট সফলভাবে সংরক্ষণ করা হয়েছে');
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                setError(response.data.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            console.error('Error saving teacher shift:', err);
        } finally {
            setLoading(false);
        }
    };

    // SMS type options
    const smsTypes = [
        { value: 'entry_exit', label: 'Entry and Exit' },
        { value: 'only_entry', label: 'Only Entry' },
        { value: 'only_exit', label: 'Only Exit' },
        { value: 'only_absent', label: 'Only Absent' }
    ];

    // Count Late After options
    const lateAfterOptions = [10, 20, 30, 40, 50];

    // Count Early Exit Before options
    const earlyExitOptions = [20, 40, 60];

    // Absent after options
    const absentAfterOptions = [1, 2, 3, 4, 5];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            নতুন শিক্ষক শিফট
                        </h1>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            পিছনে যান
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Teacher Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teachers <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={handleTeacherChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">শিক্ষক নির্বাচন করুন</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name} - {teacher.designation} ({teacher.mobile})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected Teacher Info */}
                            {selectedTeacher && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">নির্বাচিত শিক্ষক:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <p><span className="font-medium">নাম:</span> {selectedTeacher.name}</p>
                                        <p><span className="font-medium">মোবাইল:</span> {selectedTeacher.mobile}</p>
                                        <p><span className="font-medium">পদবী:</span> {selectedTeacher.designation}</p>
                                        <p><span className="font-medium">স্ট্যাটাস:</span> {selectedTeacher.position}</p>
                                    </div>
                                </div>
                            )}

                            {/* Shift Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shift Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shiftName"
                                    value={formData.shiftName}
                                    onChange={handleInputChange}
                                    placeholder="শিফটের নাম লিখুন"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Time Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Teacher Entry Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teacher Entry Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="teacherEntryTime"
                                        value={formData.teacherEntryTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Teacher Exit Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teacher Exit Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="teacherExitTime"
                                        value={formData.teacherExitTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Late and Early Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Count Late After */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Count Late After (minutes)
                                    </label>
                                    <select
                                        name="countLateAfter"
                                        value={formData.countLateAfter}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">মিনিট নির্বাচন করুন</option>
                                        {lateAfterOptions.map(minute => (
                                            <option key={minute} value={minute}>
                                                {minute} minutes
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Count Early Exit Before */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Count Early Exit Before (minutes)
                                    </label>
                                    <select
                                        name="countEarlyExitBefore"
                                        value={formData.countEarlyExitBefore}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">মিনিট নির্বাচন করুন</option>
                                        {earlyExitOptions.map(minute => (
                                            <option key={minute} value={minute}>
                                                {minute} minutes
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Timezone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <input
                                    type="text"
                                    name="timezone"
                                    value={formData.timezone}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">ডিফল্ট টাইমজোন: Asia/Dhaka</p>
                            </div>

                            {/* SMS Settings */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">SMS সেটিংস</h3>
                                
                                {/* Send SMS Checkbox */}
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="sendSms"
                                        checked={formData.sendSms}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Send SMS
                                    </label>
                                </div>

                                {formData.sendSms && (
                                    <div className="space-y-4">
                                        {/* SMS Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                SMS Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="smsType"
                                                value={formData.smsType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">SMS টাইপ নির্বাচন করুন</option>
                                                {smsTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Absent After */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Absent After (hours)
                                            </label>
                                            <select
                                                name="absentAfter"
                                                value={formData.absentAfter}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">ঘন্টা নির্বাচন করুন</option>
                                                {absentAfterOptions.map(hour => (
                                                    <option key={hour} value={hour}>
                                                        {hour} hour
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>সংরক্ষণ হচ্ছে...</span>
                                        </div>
                                    ) : (
                                        'Save Shift'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewTeacherShift;