import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const BuySms = ({ onClose }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch pricing
    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await axiosInstance.get('/sms-balance/pricing');
                if (response.data?.success) {
                    setPricing(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching pricing:', err);
            }
        };

        fetchPricing();
    }, []);

    // Calculate prices
    const calculatePrices = () => {
        if (!amount || amount < 10) return null;

        const basePrice = amount * (pricing?.pricePerSMS || 0.40);
        let onlineCharge = 0;
        let totalPrice = basePrice;

        if (paymentMethod === 'online') {
            onlineCharge = basePrice * ((pricing?.onlineChargePercent || 2.5) / 100);
            totalPrice = basePrice + onlineCharge;
        }

        return {
            basePrice,
            onlineCharge,
            totalPrice
        };
    };

    const prices = calculatePrices();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!amount || amount < 10) {
            setError('ন্যূনতম ১০ টি এসএমএস ক্রয় করুন');
            return;
        }

        if (amount > 10000) {
            setError('সর্বোচ্চ ১০,০০০ টি এসএমএস ক্রয় করতে পারবেন');
            return;
        }

        if (!paymentMethod) {
            setError('পেমেন্ট মেথড নির্বাচন করুন');
            return;
        }

        if (paymentMethod === 'manual' && !transactionId) {
            setError('ট্রানজেকশন আইডি দিন');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                amount: parseInt(amount),
                paymentMethod: paymentMethod,
                transactionId: transactionId || undefined,
                phoneNumber: phoneNumber || undefined
            };

            const response = await axiosInstance.post('/sms-balance/purchase', payload);

            if (response.data && response.data.success) {
                setSuccess(response.data.message);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setError(response.data?.message || 'ক্রয় রিকোয়েস্ট তৈরি করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'সার্ভার সমস্যা হয়েছে');
            console.error('Error purchasing SMS:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className=" px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold ">এসএমএস ক্রয় করুন</h1>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 rounded transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">

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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="এসএমএস সংখ্যা লিখুন"
                                    min="10"
                                    max="10000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    ন্যূনতম ১০ টি, সর্বোচ্চ ১০,০০০ টি এসএমএস
                                </p>
                            </div>

                            {/* Price Calculation */}
                            {prices && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">মূল্য বিবরণ</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">মূল এসএমএস মূল্য:</span>
                                            <span className="font-medium">৳{prices.basePrice.toFixed(2)}</span>
                                        </div>
                                        {paymentMethod === 'online' && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">অনলাইন চার্জ (২.৫%):</span>
                                                <span className="font-medium">+৳{prices.onlineCharge.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="text-gray-800 font-medium">মোট মূল্য:</span>
                                            <span className="text-[#1e90c9] font-bold">৳{prices.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পেমেন্ট মেথড <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('online')}
                                        className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 ${
                                            paymentMethod === 'online'
                                                ? 'border-[#1e90c9] bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium text-gray-900">Pay Online Now</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Instant SMS credit using payment gateway (+2.5% online charge)
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('manual')}
                                        className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 ${
                                            paymentMethod === 'manual'
                                                ? 'border-[#1e90c9] bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="font-medium text-gray-900">Send Manual Request</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Pay manually to bKash (01796 323631) and wait for approval (No extra charge)
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Transaction ID (for manual payment) */}
                            {paymentMethod === 'manual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        bKash ট্রানজেকশন আইডি <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="bKash ট্রানজেকশন আইডি লিখুন"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>
                            )}

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    আপনার ফোন নম্বর
                                </label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="০১xxxxxxxxx"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            {/* Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-[#1e90c9]">
                                    <strong>নোট:</strong> Online payment includes 2.5% convenience charge. 
                                    For example: 100 SMS (৳40) + 2.5% (৳1.00) = Total ৳41.00
                                </p>
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
                                <MainButton
                                    type="submit"
                                    disabled={loading || !paymentMethod}
                                    className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                        loading || !paymentMethod
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : paymentMethod === 'online'
                                            ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                            : 'bg-[#1e90c9] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>প্রক্রিয়াকরণ হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'online' ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                                    </svg>
                                                    <span>Pay Online Now</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                                    </svg>
                                                    <span>Send Manual Request</span>
                                                </>
                                            )}
                                        </>
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

export default BuySms;