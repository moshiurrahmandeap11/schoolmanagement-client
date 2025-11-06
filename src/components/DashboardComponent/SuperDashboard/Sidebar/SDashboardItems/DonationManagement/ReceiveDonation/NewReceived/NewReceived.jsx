import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const NewReceived = ({ onBack }) => {
  const [donors, setDonors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    projectId: '',
    donorId: '',
    paymentMethod: 'bkash',
    donorName: '',
    donorAccountNumber: '',
    donorBranch: '',
    amount: '',
    collectedBy: localStorage.getItem('userName') || '',
    note: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donorRes, accRes, projRes] = await Promise.all([
          axiosInstance.get('/donation/donors'),
          axiosInstance.get('/donation/donor-account'),
          axiosInstance.get('/donation/projects').catch(() => ({ data: { data: [] } }))
        ]);

        setDonors(donorRes.data.data || []);
        setAccounts(accRes.data.data || []);
        setProjects(projRes.data.data || []);
      } catch (err) {
        console.error('Data load error:', err);
        Swal.fire({
          title: 'সতর্কতা!',
          text: 'ডাটা লোড করতে সমস্যা। তবে আপনি চালিয়ে যেতে পারেন।',
          icon: 'warning',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDonorChange = (donorId) => {
    const donor = donors.find(d => d._id === donorId);
    if (donor) {
      setForm(prev => ({
        ...prev,
        donorId,
        donorName: donor.donorName,
        donorAccountNumber: donor.mobile
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // শুধু আবশ্যকীয় ফিল্ড চেক
    if (!form.donorId || !form.amount || !form.collectedBy) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'দাতা, পরিমাণ ও সংগ্রহকারী আবশ্যক',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
      setSubmitting(false);
      return;
    }

    // amount validation
    if (parseFloat(form.amount) <= 0) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'দানের পরিমাণ ০ এর বেশি হতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
      setSubmitting(false);
      return;
    }

    // accountId খুঁজে বের করা
    const selectedAccount = accounts.find(a =>
      a.bankAccountNumber === form.donorAccountNumber ||
      a.bkashNumber === form.donorAccountNumber ||
      a.nagadNumber === form.donorAccountNumber ||
      a.rocketNumber === form.donorAccountNumber
    );

    const payload = {
      donorId: form.donorId,
      donorName: form.donorName,
      donorMobile: donors.find(d => d._id === form.donorId)?.mobile,
      accountId: selectedAccount?._id,
      accountNumber: form.donorAccountNumber,
      accountType: form.paymentMethod,
      amount: parseFloat(form.amount),
      collectedBy: form.collectedBy,
      note: form.note
    };

    // শুধু যদি প্রজেক্ট সিলেক্ট করা থাকে, তাহলে পাঠাও
    if (form.projectId) {
      payload.projectId = form.projectId;
    }

    try {
      const result = await Swal.fire({
        title: 'আপনি কি নিশ্চিত?',
        html: `
          <div class="text-left space-y-2">
            <p><strong>দাতা:</strong> ${form.donorName}</p>
            <p><strong>পরিমাণ:</strong> ৳${form.amount}</p>
            <p><strong>পদ্ধতি:</strong> ${form.paymentMethod === 'bkash' ? 'বিকাশ' : form.paymentMethod === 'nagad' ? 'নগদ' : form.paymentMethod === 'rocket' ? 'রকেট' : 'ব্যাংক'}</p>
            <p><strong>সংগ্রহকারী:</strong> ${form.collectedBy}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'হ্যাঁ, দান গ্রহণ করুন',
        cancelButtonText: 'বাতিল করুন',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axiosInstance.post('/donation/received-donations', payload);
        
        Swal.fire({
          title: 'সফল!',
          html: `
            <div class="text-center space-y-3">
              <p class="text-lg font-semibold">দান সফলভাবে গ্রহণ করা হয়েছে!</p>
              <div class="text-sm text-gray-600 space-y-1">
                <p><strong>দাতা:</strong> ${form.donorName}</p>
                <p><strong>পরিমাণ:</strong> ৳${form.amount}</p>
                <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        }).then(() => {
          onBack();
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.response?.data?.message || 'দান গ্রহণ করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-sm"
          >
            <FaArrowLeft /> ফিরে যান
          </button>
          <h2 className="text-xl font-semibold text-gray-800">নতুন দান গ্রহণ করুন</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Donation Project - এখন অপশনাল */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দানের প্রজেক্ট <span className="text-gray-400 text-xs">(ঐচ্ছিক)</span>
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">-- কোনো প্রজেক্ট নয় --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Donor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দাতা <span className="text-red-500">*</span>
            </label>
            <select
              value={form.donorId}
              onChange={(e) => handleDonorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            >
              <option value="">-- দাতা নির্বাচন করুন --</option>
              {donors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.donorName} - {d.mobile} ({d.categoryName || 'কোনো ক্যাটাগরি নেই'})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পরিশোধের ধরণ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['bkash', 'nagad', 'rocket', 'bank'].map(method => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm capitalize">
                    {method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : method === 'rocket' ? 'রকেট' : 'ব্যাংক'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Auto-filled fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">দাতার নাম</label>
              <input
                type="text"
                value={form.donorName}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">একাউন্ট নম্বর</label>
              <input
                type="text"
                value={form.donorAccountNumber}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {form.paymentMethod === 'bank' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">শাখা</label>
              <input
                type="text"
                value={form.donorBranch}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দানের পরিমাণ (টাকা) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-medium text-green-600">৳</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="১০০০"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                min="1"
              />
            </div>
          </div>

          {/* Collected By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              সংগ্রহকারী <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.collectedBy}
              onChange={(e) => setForm({ ...form, collectedBy: e.target.value })}
              placeholder="যেমন: আব্দুর রহিম"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নোট (ঐচ্ছিক)
            </label>
            <RichTextEditor
              value={form.note}
              onChange={(html) => setForm({ ...form, note: html })}
              placeholder="বিস্তারিত লিখুন..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FaSave />
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'দান গ্রহণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReceived;