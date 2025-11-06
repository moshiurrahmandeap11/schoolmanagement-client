import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaExclamationCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const AllBranch = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/branches');
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        setError('শাখা লোড করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `"${name}" শাখাটি স্থায়ীভাবে মুছে ফেলা হবে!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন'
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/branches/${id}`);
        if (response.data.success) {
          setBranches(branches.filter(branch => branch._id !== id));
          Swal.fire('ডিলিট হয়েছে!', 'শাখাটি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
        }
      } catch (err) {
        Swal.fire('এরর!', err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে', 'error');
      }
    }
  };

const handleToggle = async (id, currentStatus, name) => {
  try {
    const response = await axiosInstance.patch(`/branches/${id}/toggle`);

    if (response.data.success) {
      // ব্যাকএন্ড থেকে নতুন স্ট্যাটাস নিয়ে আপডেট করো
      const newStatus = response.data.data.isActive;

      setBranches(branches.map(branch =>
        branch._id === id 
          ? { ...branch, isActive: newStatus } 
          : branch
      ));

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: `"${name}" শাখা এখন ${newStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (err) {
    Swal.fire('এরর!', err.response?.data?.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে', 'error');
  }
};

  // Edit Modal with SweetAlert2
  const handleEdit = async (branch) => {
    const { value: formValues } = await Swal.fire({
      title: `<strong class="text-xl">শাখা এডিট করুন</strong>`,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">শাখার নাম</label>
            <input id="swal-name" class="swal2-input" value="${branch.name}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
            <input id="swal-address" class="swal2-input" value="${branch.address || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
            <input id="swal-phone" class="swal2-input" value="${branch.phone || ''}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">লোগো (নতুন হলে আপলোড করুন)</label>
            <div class="text-center">
              ${branch.logo ? `
                <img src="${baseImageURL}${branch.logo}" alt="Current Logo" class="w-24 h-24 object-cover rounded-lg mx-auto mb-2 border">
                <p class="text-xs text-gray-500">বর্তমান লোগো</p>
              ` : '<p class="text-gray-500">কোনো লোগো নেই</p>'}
              <input type="file" id="swal-logo" accept="image/*" class="swal2-file mt-2">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'আপডেট করুন',
      cancelButtonText: 'বাতিল',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value.trim();
        const address = document.getElementById('swal-address').value.trim();
        const phone = document.getElementById('swal-phone').value.trim();
        const logoFile = document.getElementById('swal-logo').files[0];

        if (!name || !phone) {
          Swal.showValidationMessage('নাম ও মোবাইল নম্বর আবশ্যক!');
          return false;
        }

        return { name, address, phone, logo: logoFile };
      }
    });

    if (formValues) {
      const { name, address, phone, logo } = formValues;
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      formData.append('phone', phone);
      if (logo) formData.append('logo', logo);

      Swal.fire({
        title: 'আপডেট হচ্ছে...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await axiosInstance.put(`/branches/${branch._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const updatedBranch = response.data.data;
          setBranches(branches.map(b => b._id === branch._id ? updatedBranch : b));
          Swal.fire({
            icon: 'success',
            title: 'সফল!',
            text: 'শাখা সফলভাবে আপডেট হয়েছে',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (err) {
        Swal.fire('এরর!', err.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে', 'error');
      }
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-center gap-3">
          <FaExclamationCircle className="text-2xl" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">সকল শাখা</h2>
          <p className="text-gray-600 mt-1">মোট শাখা: <strong>{branches.length}</strong> টি</p>
        </div>

        {branches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl text-gray-300 mb-4">No branches</div>
            <p className="text-xl text-gray-500">এখনো কোনো শাখা তৈরি করা হয়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">লোগো</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">নাম</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">ঠিকানা</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">মোবাইল</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">স্ট্যাটাস</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      {branch.logo ? (
                        <img
                          src={`${baseImageURL}${branch.logo}`}
                          alt={branch.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.src = '/default-branch-logo.png';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Logo</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 font-semibold text-gray-800">{branch.name}</td>
                    <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{branch.address || '—'}</td>
                    <td className="px-4 py-4 text-gray-700">{branch.phone || '—'}</td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggle(branch._id, branch.isActive, branch.name)}
                        className={`p-2 rounded-lg transition-all ${
                          branch.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {branch.isActive ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="এডিট করুন"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch._id, branch.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ডিলিট করুন"
                        >
                          <FaTrash className="text-lg" />
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

export default AllBranch;