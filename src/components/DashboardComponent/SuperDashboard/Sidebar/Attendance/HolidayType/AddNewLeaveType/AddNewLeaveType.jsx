import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewLeaveType = ({ holidayType, onClose }) => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Set form data if editing
    useEffect(() => {
        if (holidayType) {
            setFormData({
                name: holidayType.name
            });
        }
    }, [holidayType]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('ছুটির ধরনের নাম প্রয়োজন');
            return false;
        }

        if (formData.name.trim().length < 2) {
            setError('ছুটির ধরনের নাম কমপক্ষে ২ অক্ষরের হতে হবে');
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
            const url = holidayType ? `/holiday-type/${holidayType._id}` : '/holiday-type';
            const method = holidayType ? 'put' : 'post';

            const response = await axiosInstance[method](url, formData);

            if (response.data && response.data.success) {
                setSuccess(holidayType ? 'ছুটির ধরন সফলভাবে আপডেট হয়েছে' : 'ছুটির ধরন সফলভাবে তৈরি হয়েছে');
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
            console.error('Error saving holiday type:', err);
        } finally {
            setLoading(false);
        }
    };

    // Common holiday type suggestions
    const commonHolidayTypes = [
        'বার্ষিক ছুটি',
        'সরকারি ছুটি',
        'ধর্মীয় ছুটি',
        'জাতীয় দিবস',
        'বিশেষ ছুটি',
        'জরুরী ছুটি',
        'আবহাওয়া সংক্রান্ত ছুটি',
        'শিক্ষকদের ছুটি',
        'প্রশাসনিক ছুটি'
    ];

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            name: suggestion
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {holidayType ? 'ছুটির ধরন এডিট করুন' : 'নতুন ছুটির ধরন যোগ করুন'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-800 rounded transition-colors duration-200"
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
                                ছুটির ধরনের নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="ছুটির ধরনের নাম লিখুন (যেমন: বার্ষিক ছুটি, সরকারি ছুটি)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                                required
                                maxLength={100}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.name.length}/100 অক্ষর
                            </div>
                        </div>

                        {/* Common Suggestions */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                সাধারণ ছুটির ধরন (দ্রুত নির্বাচন):
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {commonHolidayTypes.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form Instructions */}
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">নির্দেশনা:</h4>
                            <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                                <li>ছুটির ধরনের নাম স্পষ্ট এবং বর্ণনামূলক হতে হবে</li>
                                <li>একই নামে একাধিক ছুটির ধরন থাকতে পারবে না</li>
                                <li>ছুটির ধরন ডিলিট করলে তা সফট ডিলিট হবে</li>
                                <li>ছুটির ধরন এডিট করলে সংশ্লিষ্ট সকল ডেটা আপডেট হবে</li>
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
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
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{holidayType ? 'আপডেট হচ্ছে...' : 'সেভ হচ্ছে...'}</span>
                                    </>
                                ) : (
                                    <span>{holidayType ? 'আপডেট করুন' : 'সেভ করুন'}</span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Preview Section */}
                    {formData.name && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">প্রিভিউ:</h4>
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-800">
                                        {formData.name}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {holidayType ? 'এডিট মোড' : 'নতুন'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    এই ছুটির ধরনটি {holidayType ? 'আপডেট' : 'যোগ'} করা হবে
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddNewLeaveType;