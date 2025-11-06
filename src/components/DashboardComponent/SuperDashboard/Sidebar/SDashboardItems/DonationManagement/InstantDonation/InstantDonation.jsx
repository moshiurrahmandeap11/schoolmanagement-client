import React, { useState } from 'react';
import { FaDonate, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const InstantDonation = () => {
  const [formData, setFormData] = useState({
    donorName: '',
    address: '',
    mobile: '',
    amount: '',
    collectedBy: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.donorName || !formData.mobile || !formData.amount || !formData.collectedBy) {
      setMessage({ text: 'সব * চিহ্নিত ফিল্ড পূরণ করুন!', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axiosInstance.post('/donation/instant-donations', formData);

      if (response.data.success) {
        setMessage({ text: 'দান সফলভাবে গ্রহণ করা হয়েছে!', type: 'success' });
        setFormData({
          donorName: '',
          address: '',
          mobile: '',
          amount: '',
          collectedBy: ''
        });

        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'দান গ্রহণ করতে সমস্যা হয়েছে',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaDonate className="text-4xl text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">ইনস্ট্যান্ট দান গ্রহণ</h2>
          <p className="text-gray-600 mt-2">তাৎক্ষণিক দান সংগ্রহ করুন</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              দাতার নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="যেমন: আব্দুল্লাহ আল মামুন"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ঠিকানা
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="গ্রাম/এলাকা, উপজেলা, জেলা"
            />
          </div>

          {/* Mobile */}
          <div>
            <label classNameName="block text-sm font-semibold text-gray-700 mb-2">
              মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="যেমন: 01700000000"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              দানের পরিমাণ (টাকা) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="যেমন: 5000"
              min="1"
            />
          </div>

          {/* Collected By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              সংগ্রহকারীর নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="collectedBy"
              value={formData.collectedBy}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="যেমন: রহিম উদ্দিন"
            />
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                loading
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  গ্রহণ করা হচ্ছে...
                </>
              ) : (
                <>
                  <FaDonate />
                  দান গ্রহণ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstantDonation;