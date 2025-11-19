import { useEffect, useState } from 'react';
import { FaCopy, FaEdit, FaPhone, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const DonationAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/donation/donor-account');
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'একাউন্ট লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = async (account) => {
    const { value: formValues } = await Swal.fire({
      title: 'একাউন্ট এডিট করুন',
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ব্যাংকের নাম</label>
            <input id="bankName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.bankName || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">শাখা</label>
            <input id="bankBranch" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.bankBranch || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ব্যাংক একাউন্ট নম্বর</label>
            <input id="bankAccountNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.bankAccountNumber || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">বিকাশ নম্বর</label>
            <input id="bkashNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.bkashNumber || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">নগদ নম্বর</label>
            <input id="nagadNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.nagadNumber || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">রকেট নম্বর</label>
            <input id="rocketNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.rocketNumber || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">যোগাযোগের নম্বর <span class="text-red-500">*</span></label>
            <input id="contactNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" value="${account.contactNumber}" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'আপডেট করুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#1e90c9',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const contactNumber = document.getElementById('contactNumber').value.trim();
        if (!contactNumber) {
          Swal.showValidationMessage('যোগাযোগের নম্বর আবশ্যক!');
          return false;
        }
        return {
          bankName: document.getElementById('bankName').value.trim(),
          bankBranch: document.getElementById('bankBranch').value.trim(),
          bankAccountNumber: document.getElementById('bankAccountNumber').value.trim(),
          bkashNumber: document.getElementById('bkashNumber').value.trim(),
          nagadNumber: document.getElementById('nagadNumber').value.trim(),
          rocketNumber: document.getElementById('rocketNumber').value.trim(),
          contactNumber
        };
      }
    });

    if (formValues) {
      try {
        const res = await axiosInstance.put(`/donation/donor-account/${account._id}`, formValues);
        if (res.data.success) {
          setAccounts(accounts.map(a => a._id === account._id ? res.data.data : a));
          Swal.fire({
            title: 'সফল!',
            text: 'একাউন্ট আপডেট করা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#1e90c9',
          });
        }
      } catch {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'আপডেট করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `এই একাউন্ট মুছে ফেলবেন?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/donation/donor-account/${id}`);
        setAccounts(accounts.filter(a => a._id !== id));
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'একাউন্ট সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      } catch {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      }
    }
  };

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'নতুন দানের একাউন্ট যোগ করুন',
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ব্যাংকের নাম</label>
            <input id="bankName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="যেমন: সোনালী ব্যাংক">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">শাখা</label>
            <input id="bankBranch" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="যেমন: মিরপুর শাখা">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ব্যাংক একাউন্ট নম্বর</label>
            <input id="bankAccountNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="১২৩৪৫৬৭৮৯০">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">বিকাশ নম্বর</label>
            <input id="bkashNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="০১৭০০০০০০০০">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">নগদ নম্বর</label>
            <input id="nagadNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="০১৮০০০০০০০০">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">রকেট নম্বর</label>
            <input id="rocketNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="0190000000">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">যোগাযোগের নম্বর <span class="text-red-500">*</span></label>
            <input id="contactNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none" placeholder="০১৭০০০০০০০০" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'যোগ করুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#1e90c9',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const contactNumber = document.getElementById('contactNumber').value.trim();
        if (!contactNumber) {
          Swal.showValidationMessage('যোগাযোগের নম্বর আবশ্যক!');
          return false;
        }
        return {
          bankName: document.getElementById('bankName').value.trim(),
          bankBranch: document.getElementById('bankBranch').value.trim(),
          bankAccountNumber: document.getElementById('bankAccountNumber').value.trim(),
          bkashNumber: document.getElementById('bkashNumber').value.trim(),
          nagadNumber: document.getElementById('nagadNumber').value.trim(),
          rocketNumber: document.getElementById('rocketNumber').value.trim(),
          contactNumber
        };
      }
    });

    if (formValues) {
      try {
        const res = await axiosInstance.post('/donation/donor-account', formValues);
        if (res.data.success) {
          Swal.fire({
            title: 'সফল!',
            text: 'একাউন্ট যোগ করা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#1e90c9',
          });
          setAccounts([res.data.data, ...accounts]);
        }
      } catch (err) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: err.response?.data?.message || 'যোগ করতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: 'কপি হয়েছে!',
      text: 'নম্বর ক্লিপবোর্ডে কপি হয়েছে',
      icon: 'success',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#1e90c9',
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">দানের একাউন্ট সমূহ</h2>
            <p className="text-gray-600 mt-1">মোট: <strong className="text-[#1e90c9]">{accounts.length}</strong> টি</p>
          </div>
          <MainButton
            onClick={handleAdd}
          >
            <FaPlus /> নতুন একাউন্ট
          </MainButton>
        </div>

        {/* Table */}
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">🏦</div>
            <p className="text-gray-500">কোনো একাউন্ট যোগ করা হয়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ব্যাংক / মোবাইল ব্যাংকিং</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">নম্বর</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">যোগাযোগ</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, i) => (
                  <tr key={acc._id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      {acc.bankName ? (
                        <div>
                          <div className="font-medium text-sm">{acc.bankName}</div>
                          <div className="text-xs text-gray-600">{acc.bankBranch}</div>
                        </div>
                      ) : acc.bkashNumber ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">বিকাশ</span>
                      ) : acc.nagadNumber ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">নগদ</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">রকেট</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {acc.bankAccountNumber || acc.bkashNumber || acc.nagadNumber || acc.rocketNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(acc.bankAccountNumber || acc.bkashNumber || acc.nagadNumber || acc.rocketNumber)}
                          className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                          title="কপি করুন"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={`tel:${acc.contactNumber}`} 
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm"
                      >
                        <FaPhone size={12} /> {acc.contactNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(acc)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="এডিট"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(acc._id, acc.bankName)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="ডিলিট"
                        >
                          <FaTrash size={14} />
                        </button>
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
  );
};

export default DonationAccount;