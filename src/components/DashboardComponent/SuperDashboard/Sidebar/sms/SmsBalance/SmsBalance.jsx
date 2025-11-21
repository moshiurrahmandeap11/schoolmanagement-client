import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import BuySms from './BusSms/BuySms';


const SmsBalance = () => {
    const [balance, setBalance] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBuyForm, setShowBuyForm] = useState(false);

    // Fetch balance and purchase history
    const fetchData = async () => {
        try {
            setLoading(true);
            const [balanceRes, historyRes] = await Promise.all([
                axiosInstance.get('/sms-balance/balance'),
                axiosInstance.get('/sms-balance/purchase-history')
            ]);

            if (balanceRes.data?.success) setBalance(balanceRes.data.data);
            if (historyRes.data?.success) setPurchaseHistory(historyRes.data.data);

        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching SMS data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle close buy form
    const handleCloseBuyForm = () => {
        setShowBuyForm(false);
        fetchData(); // Refresh data
    };

    if (showBuyForm) {
        return <BuySms onClose={handleCloseBuyForm} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">এসএমএস ব্যালেন্স</h1>
                        </div>
                        <MainButton
                            onClick={() => setShowBuyForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Buy SMS</span>
                        </MainButton>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Balance Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">বর্তমান ব্যালেন্স</h2>
                                
                                {balance ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-[#1e90c9] mb-2">
                                                {balance.remainingSMS}
                                            </div>
                                            <div className="text-sm text-gray-600">মোট এসএমএস</div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-semibold text-[#1e90c9]">{balance.totalSMS}</div>
                                                <div className="text-xs ">ক্রয়কৃত</div>
                                            </div>
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-semibold text-[#1e90c9]">{balance.usedSMS}</div>
                                                <div className="text-xs ">ব্যবহৃত</div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 text-center">
                                            শেষ আপডেট: {new Date(balance.lastUpdated).toLocaleDateString('bn-BD')}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="text-gray-500">ব্যালেন্স লোড করতে সমস্যা হয়েছে</div>
                                    </div>
                                )}

                                <MainButton
                                    onClick={() => setShowBuyForm(true)}
                                    className='flex items-center justify-center w-full rounded-md'
                                >
                                    আরও এসএমএস কিনুন
                                </MainButton>
                            </div>
                        </div>

                        {/* Purchase History */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">ক্রয় ইতিহাস</h2>
                                
                                {purchaseHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                        <p className="mt-4 text-lg font-medium text-gray-900">কোন ক্রয় ইতিহাস পাওয়া যায়নি</p>
                                        <p className="mt-2 text-gray-600">আপনার প্রথম এসএমএস প্যাকেজ কিনুন</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        পরিমাণ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        মূল্য
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        পদ্ধতি
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        অবস্থা
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        তারিখ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {purchaseHistory.map((purchase) => (
                                                    <tr key={purchase._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {purchase.amount} এসএমএস
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                ৳{purchase.totalPrice.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ৳{purchase.pricePerSMS}/এসএমএস
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 capitalize">
                                                                {purchase.paymentMethod}
                                                            </div>
                                                            {purchase.onlineCharge > 0 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +৳{purchase.onlineCharge.toFixed(2)} চার্জ
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                purchase.status === 'approved' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : purchase.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {purchase.status === 'approved' ? 'অনুমোদিত' : 
                                                                 purchase.status === 'pending' ? 'লম্বিত' : 'অপেক্ষমান'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(purchase.purchaseDate).toLocaleDateString('bn-BD')}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(purchase.purchaseDate).toLocaleTimeString('bn-BD')}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmsBalance;