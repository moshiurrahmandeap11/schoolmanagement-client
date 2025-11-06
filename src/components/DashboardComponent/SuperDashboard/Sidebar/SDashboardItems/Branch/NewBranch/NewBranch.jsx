import React, { useState } from 'react';

import { FaUpload, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const NewBranch = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // success or error

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    document.getElementById('logo-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ text: 'শাখার নাম আবশ্যক!', type: 'error' });
      return;
    }

    if (!formData.phone.trim()) {
      setMessage({ text: 'মোবাইল নম্বর আবশ্যক!', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('address', formData.address.trim());
    data.append('phone', formData.phone.trim());
    if (logo) {
      data.append('logo', logo);
    }

    try {
      const response = await axiosInstance.post('/branches', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ text: 'নতুন শাখা সফলভাবে তৈরি হয়েছে!', type: 'success' });

        // Reset form
        setFormData({ name: '', address: '', phone: '' });
        setLogo(null);
        setLogoPreview(null);
        document.getElementById('logo-input').value = '';

        // Auto hide message after 5 seconds
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'শাখা তৈরি করতে সমস্যা হয়েছে';
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          নতুন শাখা তৈরি করুন
        </h2>
        <p className="text-gray-600 mb-8">আপনার প্রতিষ্ঠানের নতুন শাখার তথ্য যোগ করুন</p>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FaCheckCircle className="text-xl" />
            ) : (
              <FaExclamationCircle className="text-xl" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* শাখার নাম */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              শাখার নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="যেমন: মিরপুর শাখা"
              required
            />
          </div>

          {/* লোগো আপলোড */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              শাখার লোগো (অপশনাল)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ) : (
                <div>
                  <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">লোগো আপলোড করুন</p>
                  <p className="text-xs text-gray-500">PNG, JPG (সর্বোচ্চ 5MB)</p>
                </div>
              )}
              <input
                id="logo-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="logo-input"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ফাইল নির্বাচন করুন
              </label>
            </div>
          </div>

          {/* ঠিকানা */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ঠিকানা
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="পূর্ণ ঠিকানা লিখুন (যেমন: বাড়ি নং, রোড, উপজেলা, জেলা)"
            />
          </div>

          {/* মোবাইল নম্বর */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="যেমন: 01700000000"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-wrap gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-3 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  তৈরি হচ্ছে...
                </>
              ) : (
                'শাখা তৈরি করুন'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ name: '', address: '', phone: '' });
                setLogo(null);
                setLogoPreview(null);
                setMessage({ text: '', type: '' });
              }}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              রিসেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBranch;