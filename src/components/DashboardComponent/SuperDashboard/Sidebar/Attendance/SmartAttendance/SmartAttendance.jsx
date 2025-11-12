import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const SmartAttendance = () => {
    const [formData, setFormData] = useState({
        studentEntryTime: '',
        studentExitTime: '',
        countLateAfter: '',
        countEarlyExitBefore: '',
        class: '',
        section: '',
        timezone: 'Asia/Dhaka',
        sendSms: false,
        smsType: '',
        absentAfter: '',
        instituteShortName: '',
        enableAbsentSms: false
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch classes and sections
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch classes
                const classResponse = await axiosInstance.get('/class');
                if (classResponse.data && classResponse.data.success) {
                    setClasses(classResponse.data.data || []);
                }

                // Fetch sections
                const sectionResponse = await axiosInstance.get('/sections');
                if (sectionResponse.data && Array.isArray(sectionResponse.data)) {
                    setSections(sectionResponse.data);
                } else if (sectionResponse.data && sectionResponse.data.success) {
                    setSections(sectionResponse.data.data || []);
                }

            } catch (err) {
                setError('ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching data:', err);
            }
        };

        fetchInitialData();
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
        if (!formData.studentEntryTime || !formData.studentExitTime) {
            setError('স্টুডেন্ট এন্ট্রি এবং এক্সিট টাইম প্রয়োজন');
            return;
        }

        if (!formData.class) {
            setError('ক্লাস নির্বাচন করুন');
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

            const response = await axiosInstance.post('/smart-attendance', formData);

            if (response.data && response.data.success) {
                setSuccess('স্মার্ট অ্যাটেনডেন্স সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে');
                // Reset form after success
                setFormData({
                    studentEntryTime: '',
                    studentExitTime: '',
                    countLateAfter: '',
                    countEarlyExitBefore: '',
                    class: '',
                    section: '',
                    timezone: 'Asia/Dhaka',
                    sendSms: false,
                    smsType: '',
                    absentAfter: '',
                    instituteShortName: '',
                    enableAbsentSms: false
                });
            } else {
                setError(response.data.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
            console.error('Error saving smart attendance:', err);
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

    // Absent after options
    const absentAfterOptions = [1, 2, 3, 4, 5, 6];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            স্মার্ট অ্যাটেনডেন্স সেটিংস
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
                                {/* Student Entry Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Entry Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="studentEntryTime"
                                        value={formData.studentEntryTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Student Exit Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Exit Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="studentExitTime"
                                        value={formData.studentExitTime}
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
                                    <input
                                        type="number"
                                        name="countLateAfter"
                                        value={formData.countLateAfter}
                                        onChange={handleInputChange}
                                        placeholder="লেট হিসাবে গণনা করার সময় (মিনিট)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Count Early Exit Before */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Count Early Exit Before (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="countEarlyExitBefore"
                                        value={formData.countEarlyExitBefore}
                                        onChange={handleInputChange}
                                        placeholder="আগে এক্সিট হিসাবে গণনা করার সময় (মিনিট)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Class and Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.name}
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
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections.map(section => (
                                            <option key={section._id} value={section._id}>
                                                {section.name}
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

                                        {/* Institute Short Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Institute Short Name
                                            </label>
                                            <input
                                                type="text"
                                                name="instituteShortName"
                                                value={formData.instituteShortName}
                                                onChange={handleInputChange}
                                                placeholder="প্রতিষ্ঠানের সংক্ষিপ্ত নাম"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Enable Absent SMS */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="enableAbsentSms"
                                                checked={formData.enableAbsentSms}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                                        'সংরক্ষণ করুন'
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

export default SmartAttendance;