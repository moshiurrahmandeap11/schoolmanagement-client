import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const IncomeExpenseReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch bank accounts from API
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/bank-accounts');
                
                // Debug: Check the complete response structure
                console.log('Full API Response:', response);
                console.log('Response data:', response.data);
                console.log('Response data type:', typeof response.data);
                
                // Handle different response structures
                let accountsData = [];
                
                if (Array.isArray(response.data)) {
                    // Case 1: Direct array
                    accountsData = response.data;
                    console.log('Case 1: Direct array');
                } else if (response.data && Array.isArray(response.data.accounts)) {
                    // Case 2: { accounts: [] }
                    accountsData = response.data.accounts;
                    console.log('Case 2: accounts array');
                } else if (response.data && Array.isArray(response.data.data)) {
                    // Case 3: { data: [] }
                    accountsData = response.data.data;
                    console.log('Case 3: data array');
                } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    // Case 4: { success: true, data: [] }
                    accountsData = response.data.data;
                    console.log('Case 4: success with data array');
                } else if (response.data && typeof response.data === 'object') {
                    // Case 5: Convert object to array
                    accountsData = Object.values(response.data);
                    console.log('Case 5: Object converted to array');
                }
                
                console.log('Final accounts data:', accountsData);
                console.log('Is array?:', Array.isArray(accountsData));
                console.log('Array length:', accountsData.length);
                
                if (Array.isArray(accountsData)) {
                    setAccounts(accountsData);
                } else {
                    console.warn('Accounts data is not an array:', accountsData);
                    setAccounts([]);
                }
                
            } catch (err) {
                setError('একাউন্ট লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching accounts:', err);
                console.error('Error response:', err.response);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // Handle download report
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

            const params = {
                start_date: startDate,
                end_date: endDate,
                ...(selectedAccount && { account_id: selectedAccount })
            };

            const response = await axiosInstance.get('/reports/income-expense', {
                params,
                responseType: 'blob'
            });

            // Create blob and download
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = `income_expense_report_${startDate}_to_${endDate}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            setError('রিপোর্ট ডাউনলোড করতে সমস্যা হয়েছে');
            console.error('Error downloading report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Temporary dummy data for testing
    const dummyAccounts = [
        { id: 1, account_name: 'DBBL', account_number: '1234567890' },
        { id: 2, account_name: 'Brac Bank', account_number: '9876543210' },
        { id: 3, account_name: 'City Bank', account_number: '5555555555' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            আয়-ব্যয় রিপোর্ট
                        </h1>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">সকল একাউন্ট</option>
                                
                                {/* Test with dummy data first */}
                                {dummyAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name} - {account.account_number}
                                    </option>
                                ))}
                                
                                {/* Actual API data */}
                                {Array.isArray(accounts) && accounts.length > 0 && accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name || account.name} - {account.account_number || account.number}
                                    </option>
                                ))}
                            </select>
                            
                            {loading && (
                                <p className="text-sm text-gray-500 mt-1">একাউন্ট লোড হচ্ছে...</p>
                            )}
                            
                            {/* Show message if no accounts found */}
                            {!loading && Array.isArray(accounts) && accounts.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-1">
                                    কোন একাউন্ট পাওয়া যায়নি। ডেমো একাউন্ট দেখানো হচ্ছে।
                                </p>
                            )}

                            {/* Debug info */}
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <p>Accounts array length: {accounts.length}</p>
                                <p>Is array: {Array.isArray(accounts).toString()}</p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleDownload}
                                disabled={loading || !startDate || !endDate}
                                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !startDate || !endDate
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>ডাউনলোড হচ্ছে...</span>
                                    </div>
                                ) : (
                                    'ডাউনলোড করুন'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <p className="text-center">
                                নির্বাচিত তারিখ এবং একাউন্ট অনুযায়ী আয়-ব্যয়ের রিপোর্ট ডাউনলোড হবে
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeExpenseReport;