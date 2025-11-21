import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const SmartAttendanceTeacher = () => {
    const [formData, setFormData] = useState({
        teacherEntryTime: '',
        teacherExitTime: '',
        countLateAfter: '',
        countEarlyExitBefore: '',
        timezone: 'Asia/Dhaka',
        sendSms: false,
        smsType: '',
        absentAfter: '',
        instituteShortName: '',
        enableAbsentSms: false,
        sendSmsTo: 'to_institute' // Default value
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check if settings already exist
    useEffect(() => {
        const fetchExistingSettings = async () => {
            try {
                const response = await axiosInstance.get('/smart-attendance-shift');
                if (response.data && response.data.success && response.data.data.length > 0) {
                    // Find teacher-specific settings or use the first one
                    const teacherSettings = response.data.data.find(shift => 
                        shift.teacherEntryTime || shift.teacherExitTime
                    ) || response.data.data[0];
                    
                    if (teacherSettings) {
                        setFormData(prev => ({
                            ...prev,
                            teacherEntryTime: teacherSettings.teacherEntryTime || '',
                            teacherExitTime: teacherSettings.teacherExitTime || '',
                            countLateAfter: teacherSettings.countLateAfter || '',
                            countEarlyExitBefore: teacherSettings.countEarlyExitBefore || '',
                            timezone: teacherSettings.timezone || 'Asia/Dhaka',
                            sendSms: teacherSettings.sendSms || false,
                            smsType: teacherSettings.smsType || '',
                            absentAfter: teacherSettings.absentAfter || '',
                            instituteShortName: teacherSettings.instituteShortName || '',
                            enableAbsentSms: teacherSettings.enableAbsentSms || false,
                            sendSmsTo: teacherSettings.sendSmsTo || 'to_institute'
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching existing settings:', err);
            }
        };

        fetchExistingSettings();
    }, []);

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
        if (!formData.teacherEntryTime || !formData.teacherExitTime) {
            setError('শিক্ষকের এন্ট্রি এবং এক্সিট টাইম প্রয়োজন');
            return;
        }

        if (formData.sendSms && !formData.smsType) {
            setError('SMS টাইপ নির্বাচন করুন');
            return;
        }

        if (formData.sendSms && !formData.instituteShortName.trim()) {
            setError('ইনস্টিটিউটের সংক্ষিপ্ত নাম প্রয়োজন');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // First, get existing shifts to find the one to update
            const shiftsResponse = await axiosInstance.get('/smart-attendance-shift');
            let shiftId = null;

            if (shiftsResponse.data && shiftsResponse.data.success && shiftsResponse.data.data.length > 0) {
                // Find existing teacher shift or use the first one
                const teacherShift = shiftsResponse.data.data.find(shift => 
                    shift.teacherEntryTime || shift.teacherExitTime
                ) || shiftsResponse.data.data[0];
                
                shiftId = teacherShift._id;
            }

            const updateData = {
                teacherEntryTime: formData.teacherEntryTime,
                teacherExitTime: formData.teacherExitTime,
                countLateAfter: formData.countLateAfter || '',
                countEarlyExitBefore: formData.countEarlyExitBefore || '',
                timezone: formData.timezone || 'Asia/Dhaka',
                sendSms: formData.sendSms || false,
                smsType: formData.sendSms ? formData.smsType : '',
                absentAfter: formData.absentAfter || '',
                instituteShortName: formData.instituteShortName.trim(),
                enableAbsentSms: formData.enableAbsentSms || false,
                sendSmsTo: formData.sendSmsTo || 'to_institute',
                updatedAt: new Date()
            };

            let response;
            if (shiftId) {
                // Update existing shift
                response = await axiosInstance.put(`/smart-attendance-shift/${shiftId}`, updateData);
            } else {
                // Create new shift with teacher settings
                response = await axiosInstance.post('/smart-attendance-shift', {
                    shiftName: 'Teacher Smart Attendance',
                    class: null, // Not required for teacher settings
                    section: null, // Not required for teacher settings
                    studentEntryTime: '00:00', // Default values
                    studentExitTime: '00:00', // Default values
                    ...updateData
                });
            }

            if (response.data && response.data.success) {
                setSuccess('স্মার্ট অ্যাটেনডেন্স সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে');
            } else {
                setError(response.data.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            console.error('Error saving smart attendance settings:', err);
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

    // Send SMS to options
    const sendSmsToOptions = [
        { value: 'to_institute', label: 'To Institute' },
        { value: 'to_teacher', label: 'To Teacher' },
        { value: 'to_both', label: 'To Both' }
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
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            স্মার্ট অ্যাটেনডেন্স - শিক্ষক
                        </h1>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                        className="w-4 h-4 text-[#1e90c9] border-gray-300 rounded focus:ring-blue-500"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            >
                                                <option value="">SMS টাইপ নির্বাচন করুন</option>
                                                {smsTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Send SMS To */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Send SMS To
                                            </label>
                                            <select
                                                name="sendSmsTo"
                                                value={formData.sendSmsTo}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            >
                                                {sendSmsToOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            >
                                                <option value="">ঘন্টা নির্বাচন করুন</option>
                                                {absentAfterOptions.map(hour => (
                                                    <option key={hour} value={hour}>
                                                        {hour} hour
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Institute Short Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Institute Short Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="instituteShortName"
                                                value={formData.instituteShortName}
                                                onChange={handleInputChange}
                                                placeholder="প্রতিষ্ঠানের সংক্ষিপ্ত নাম"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                            />
                                        </div>

                                        {/* Enable Absent SMS */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="enableAbsentSms"
                                                checked={formData.enableAbsentSms}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-[#1e90c9]"
                                            />
                                            <label className="ml-2 text-sm font-medium text-gray-700">
                                                Enable absent SMS
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#1e90c9]'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>সংরক্ষণ হচ্ছে...</span>
                                        </div>
                                    ) : (
                                        'সংরক্ষণ করুন'
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartAttendanceTeacher;