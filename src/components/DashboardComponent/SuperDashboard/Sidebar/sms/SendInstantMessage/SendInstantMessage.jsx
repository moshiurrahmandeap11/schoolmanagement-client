import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';


const SendInstantMessage = () => {
    const [phoneNumbers, setPhoneNumbers] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sentMessages, setSentMessages] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('send');

    // Fetch sent messages and statistics
    const fetchData = async () => {
        try {
            setLoading(true);
            const [messagesRes, statsRes] = await Promise.all([
                axiosInstance.get('/sms/send-sms'),
                axiosInstance.get('/sms/send-sms/statistics')
            ]);

            if (messagesRes.data?.success) setSentMessages(messagesRes.data.data || []);
            if (statsRes.data?.success) setStatistics(statsRes.data.data);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle phone number input
    const handlePhoneNumbersChange = (e) => {
        const value = e.target.value;
        setPhoneNumbers(value);
    };

    // Handle message change from rich text editor
    const handleMessageChange = (content) => {
        setMessage(content);
    };

    // Validate phone numbers
    const validatePhoneNumbers = () => {
        if (!phoneNumbers.trim()) {
            setError('ফোন নম্বর প্রয়োজন');
            return false;
        }

        const numbersArray = phoneNumbers.split(',').map(num => num.trim()).filter(num => num);
        
        if (numbersArray.length === 0) {
            setError('সঠিক ফোন নম্বর দিন');
            return false;
        }

        // Validate Bangladeshi phone numbers
        const invalidNumbers = numbersArray.filter(number => !/^01[3-9]\d{8}$/.test(number));
        
        if (invalidNumbers.length > 0) {
            setError(`অবৈধ ফোন নম্বর: ${invalidNumbers.join(', ')}`);
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validatePhoneNumbers()) {
            return;
        }

        if (!message.trim()) {
            setError('বার্তা প্রয়োজন');
            return;
        }

        setSending(true);

        try {
            const payload = {
                phoneNumbers: phoneNumbers.trim(),
                message: message.trim()
            };

            const response = await axiosInstance.post('/sms/send-sms', payload);

            if (response.data && response.data.success) {
                setSuccess(response.data.message);
                if (response.data.warning) {
                    setSuccess(prev => prev + `. ${response.data.warning}`);
                }
                
                // Reset form
                setPhoneNumbers('');
                setMessage('');
                
                // Refresh data
                fetchData();
            } else {
                setError(response.data?.message || 'বার্তা পাঠাতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'সার্ভার সমস্যা হয়েছে');
            console.error('Error sending SMS:', err);
        } finally {
            setSending(false);
        }
    };

    // Handle delete message record
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই বার্তা রেকর্ড ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/sms/send-sms/${id}`);
            if (response.data && response.data.success) {
                alert('বার্তা রেকর্ড সফলভাবে ডিলিট হয়েছে');
                fetchData();
            } else {
                alert(response.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting message:', err);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('bn-BD');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">তাৎক্ষণিক বার্তা পাঠান</h1>
                    <p className="text-gray-600 mt-2">একসাথে একাধিক নম্বরে SMS বার্তা পাঠান</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('send')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'send'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                বার্তা পাঠান
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'history'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                পাঠানো বার্তা ({sentMessages.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('statistics')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'statistics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                পরিসংখ্যান
                            </button>
                        </nav>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Send Message Tab */}
                {activeTab === 'send' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">নতুন বার্তা পাঠান</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Phone Numbers */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Numbers <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={phoneNumbers}
                                    onChange={handlePhoneNumbersChange}
                                    placeholder="ফোন নম্বর কমা (,) দিয়ে আলাদা করুন। উদাহরণ: 01712345678, 01812345678, 01912345678"
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    বাংলাদেশী ফোন নম্বর ফরম্যাট (১১ ডিজিট): 01XXXXXXXXX
                                </p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বার্তা <span className="text-red-500">*</span>
                                </label>
                                <RichTextEditor
                                    value={message}
                                    onChange={handleMessageChange}
                                    placeholder="আপনার বার্তা লিখুন..."
                                    height="200px"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    সর্বোচ্চ ১৬০ ক্যারেক্টার এর মধ্যে বার্তা লিখুন
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    sending
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {sending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>বার্তা পাঠানো হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                        </svg>
                                        <span>Send Message</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">পাঠানো বার্তার ইতিহাস</h2>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                            </div>
                        ) : sentMessages.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-900">কোন বার্তা পাওয়া যায়নি</p>
                                <p className="mt-2 text-gray-600">আপনার প্রথম বার্তা পাঠান</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {sentMessages.map((msg) => (
                                    <div key={msg._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 font-medium mb-1">{msg.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {msg.phoneNumbers.length} টি নম্বর | 
                                                    সফল: {msg.successfulSends} | 
                                                    ব্যর্থ: {msg.failedSends}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="p-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded transition-colors duration-200 ml-2"
                                                title="ডিলিট করুন"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>প্রেরণের সময়: {formatDate(msg.sentAt)}</span>
                                            <span className={`px-2 py-1 rounded-full ${
                                                msg.status === 'success' ? 'bg-green-100 text-green-800' :
                                                msg.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {msg.status === 'success' ? 'সফল' : 
                                                 msg.status === 'failed' ? 'ব্যর্থ' : 'আংশিক'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Statistics Tab */}
                {activeTab === 'statistics' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">বার্তা পরিসংখ্যান</h2>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                            </div>
                        ) : statistics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{statistics.totalMessages}</div>
                                    <div className="text-sm text-blue-800">মোট বার্তা</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{statistics.totalSuccessfulSends}</div>
                                    <div className="text-sm text-green-800">সফল প্রেরণ</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{statistics.totalNumbersSent}</div>
                                    <div className="text-sm text-yellow-800">মোট নম্বর</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{statistics.successRate}%</div>
                                    <div className="text-sm text-purple-800">সাফল্যের হার</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">পরিসংখ্যান লোড করতে সমস্যা হয়েছে</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendInstantMessage;