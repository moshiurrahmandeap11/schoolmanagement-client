import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const SummaryIncomeStatement = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [accountDetails, setAccountDetails] = useState(null);

    // Fetch bank accounts from API
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/bank-accounts');
                
                console.log('API Response:', response.data);
                
                // Handle the specific response structure
                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setAccounts(response.data.data);
                } else {
                    setAccounts([]);
                    setError('একাউন্ট ডেটা লোড করতে সমস্যা হয়েছে');
                }
                
            } catch (err) {
                setError('একাউন্ট লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching accounts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // Handle download and show account details
    const handleDownload = async () => {
        if (!startDate || !endDate) {
            setError('শুরু এবং শেষ তারিখ নির্বাচন করুন');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('শেষ তারিখ শুরু তারিখের পরে হতে হবে');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Find selected account details
            const selectedAccountData = accounts.find(account => account._id === selectedAccount);
            setAccountDetails(selectedAccountData || null);

            // Show success message
            setError('একাউন্ট ডিটেইলস দেখানো হচ্ছে...');

        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            সামারি ইনকাম স্টেটমেন্ট
                        </h1>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className={`px-4 py-3 rounded-lg text-sm ${
                                error.includes('সমস্যা') 
                                ? 'bg-red-50 border border-red-200 text-red-700'
                                : 'bg-green-50 border border-green-200 text-green-700'
                            }`}>
                                {error}
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    থেকে তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পর্যন্ত তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                একাউন্টসমূহ
                            </label>
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            >
                                <option value="">সকল একাউন্ট</option>
                                {accounts.map((account) => (
                                    <option key={account._id} value={account._id}>
                                        {account.name} - {account.accountNumber}
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <p className="text-sm text-gray-500 mt-1">একাউন্ট লোড হচ্ছে...</p>
                            )}
                            
                            {!loading && accounts.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-1">কোন একাউন্ট পাওয়া যায়নি</p>
                            )}
                        </div>

                        {/* Download Button */}
                        <div className="flex justify-center pt-4">
                            <MainButton
                                onClick={handleDownload}
                                disabled={loading || !startDate || !endDate}
                                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !startDate || !endDate
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>লোড হচ্ছে...</span>
                                    </div>
                                ) : (
                                    'ডাউনলোড করুন'
                                )}
                            </MainButton>
                        </div>

                        {/* Account Details Section */}
                        {accountDetails && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                                    নির্বাচিত একাউন্টের ডিটেইলস
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">একাউন্ট নাম:</span>
                                            <span className="text-sm text-gray-800">{accountDetails.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">একাউন্ট নম্বর:</span>
                                            <span className="text-sm text-gray-800">{accountDetails.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">ব্রাঞ্চ নাম:</span>
                                            <span className="text-sm text-gray-800">{accountDetails.branchName}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">বর্তমান ব্যালেন্স:</span>
                                            <span className="text-sm text-gray-800">
                                                {new Intl.NumberFormat('en-BD').format(accountDetails.currentBalance)} ৳
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">ডিফল্ট একাউন্ট:</span>
                                            <span className="text-sm text-gray-800">
                                                {accountDetails.isDefault ? 'হ্যাঁ' : 'না'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">তৈরির তারিখ:</span>
                                            <span className="text-sm text-gray-800">
                                                {new Date(accountDetails.createdAt).toLocaleDateString('bn-BD')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {accountDetails.details && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <span className="text-sm font-medium text-gray-600">বিবরণ:</span>
                                        <p className="text-sm text-gray-800 mt-1">{accountDetails.details}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <p className="text-center">
                                নির্বাচিত তারিখ এবং একাউন্ট অনুযায়ী একাউন্ট ডিটেইলস দেখানো হবে
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryIncomeStatement;