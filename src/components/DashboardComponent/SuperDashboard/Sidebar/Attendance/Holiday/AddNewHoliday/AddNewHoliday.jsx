import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewHoliday = ({ holiday, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        session: '',
        dates: [{
            fromDate: '',
            toDate: '',
            isFullDay: true
        }]
    });
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axiosInstance.get('/sessions');
                if (response.data && (response.data.success || Array.isArray(response.data))) {
                    const sessionsData = response.data.data || response.data;
                    setSessions(Array.isArray(sessionsData) ? sessionsData : []);
                }
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError('সেশন ডেটা লোড করতে সমস্যা হয়েছে');
            }
        };

        fetchSessions();
    }, []);

    // Set form data if editing
    useEffect(() => {
        if (holiday) {
            setFormData({
                name: holiday.name,
                session: holiday.session._id,
                dates: holiday.dates.map(date => ({
                    fromDate: new Date(date.fromDate).toISOString().split('T')[0],
                    toDate: new Date(date.toDate).toISOString().split('T')[0],
                    isFullDay: date.isFullDay
                }))
            });
        }
    }, [holiday]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle date range changes
    const handleDateChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            dates: prev.dates.map((date, i) => 
                i === index ? { ...date, [field]: value } : date
            )
        }));
    };

    // Handle checkbox changes for date ranges
    const handleCheckboxChange = (index, checked) => {
        setFormData(prev => ({
            ...prev,
            dates: prev.dates.map((date, i) => 
                i === index ? { ...date, isFullDay: checked } : date
            )
        }));
    };

    // Add more date ranges
    const addMoreDates = () => {
        setFormData(prev => ({
            ...prev,
            dates: [...prev.dates, { fromDate: '', toDate: '', isFullDay: true }]
        }));
    };

    // Remove date range
    const removeDateRange = (index) => {
        if (formData.dates.length > 1) {
            setFormData(prev => ({
                ...prev,
                dates: prev.dates.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('ছুটির নাম প্রয়োজন');
            return false;
        }

        if (!formData.session) {
            setError('সেশন নির্বাচন করুন');
            return false;
        }

        for (let i = 0; i < formData.dates.length; i++) {
            const dateRange = formData.dates[i];
            if (!dateRange.fromDate || !dateRange.toDate) {
                setError('সকল তারিখের ক্ষেত্র পূরণ করুন');
                return false;
            }

            if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
                setError('শুরুর তারিখ শেষ তারিখের পরে হতে পারে না');
                return false;
            }
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
            const url = holiday ? `/holidays/${holiday._id}` : '/holidays';
            const method = holiday ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data && response.data.success) {
                setSuccess(holiday ? 'ছুটি সফলভাবে আপডেট হয়েছে' : 'ছুটি সফলভাবে তৈরি হয়েছে');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.data?.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'সার্ভার সমস্যা');
            console.error('Error saving holiday:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {holiday ? 'ছুটি এডিট করুন' : 'নতুন ছুটি যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded"
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

                        {/* Name Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ছুটির নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="ছুটির নাম লিখুন"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Session Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                সেশন <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="session"
                                value={formData.session}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">সেশন নির্বাচন করুন</option>
                                {sessions.map(session => (
                                    <option key={session._id} value={session._id}>
                                        {session.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Ranges */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    ছুটির তারিখসমূহ <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addMoreDates}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>আরও তারিখ যোগ করুন</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.dates.map((dateRange, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                তারিখ রেঞ্জ #{index + 1}
                                            </h4>
                                            {formData.dates.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDateRange(index)}
                                                    className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded text-sm"
                                                >
                                                    মুছুন
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    থেকে তারিখ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.fromDate}
                                                    onChange={(e) => handleDateChange(index, 'fromDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    পর্যন্ত তারিখ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.toDate}
                                                    onChange={(e) => handleDateChange(index, 'toDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`fullDay-${index}`}
                                                checked={dateRange.isFullDay}
                                                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`fullDay-${index}`} className="ml-2 block text-sm text-gray-700">
                                                সম্পূর্ণ দিনের ছুটি
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>সেভ হচ্ছে...</span>
                                    </>
                                ) : (
                                    <span>{holiday ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewHoliday;