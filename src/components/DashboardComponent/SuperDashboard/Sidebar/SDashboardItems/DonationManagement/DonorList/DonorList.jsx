import { useEffect, useState } from 'react';
import { FaDonate, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import NewDonor from './NewDonor/NewDonor';

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showNewDonor, setShowNewDonor] = useState(false);
  const [totalDonors, setTotalDonors] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donorRes, catRes] = await Promise.all([
        axiosInstance.get(`/donation/donors?search=${search}&category=${filterCategory}`),
        axiosInstance.get('/donation/categories')
      ]);

      if (donorRes.data.success) {
        setDonors(donorRes.data.data);
        setTotalDonors(donorRes.data.total);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
    } catch  {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ডাটা লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#1e90c9',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterCategory]);

  const handleEdit = (donor) => {
    Swal.fire({
      title: 'দাতার তথ্য এডিট করুন',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
            <select id="editCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none">
              ${categories.map(cat => 
                `<option value="${cat._id}" ${cat._id === donor.categoryId ? 'selected' : ''}>${cat.name}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">দাতার নাম</label>
            <input 
              type="text" 
              id="editDonorName" 
              value="${donor.donorName}" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
            <input 
              type="text" 
              id="editMobile" 
              value="${donor.mobile}" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
            <textarea 
              id="editAddress" 
              rows="2" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none resize-none"
            >${donor.address || ''}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (টাকা)</label>
              <input 
                type="number" 
                id="editRegularAmount" 
                value="${donor.regularAmount}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">দানের ধরন</label>
              <select id="editDonationType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none">
                <option value="monthly" ${donor.donationType === 'monthly' ? 'selected' : ''}>মাসিক</option>
                <option value="yearly" ${donor.donationType === 'yearly' ? 'selected' : ''}>বার্ষিক</option>
                <option value="one-time" ${donor.donationType === 'one-time' ? 'selected' : ''}>এককালীন</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'আপডেট করুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#1e90c9',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const categoryId = document.getElementById('editCategory').value;
        const donorName = document.getElementById('editDonorName').value;
        const mobile = document.getElementById('editMobile').value;
        const address = document.getElementById('editAddress').value;
        const regularAmount = document.getElementById('editRegularAmount').value;
        const donationType = document.getElementById('editDonationType').value;

        if (!donorName.trim()) {
          Swal.showValidationMessage('দাতার নাম প্রয়োজন');
          return false;
        }
        if (!mobile.trim()) {
          Swal.showValidationMessage('মোবাইল নম্বর প্রয়োজন');
          return false;
        }
        if (!regularAmount || regularAmount <= 0) {
          Swal.showValidationMessage('সঠিক পরিমাণ দিন');
          return false;
        }

        return {
          categoryId,
          donorName: donorName.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          regularAmount: parseFloat(regularAmount),
          donationType
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosInstance.put(`/donation/donors/${donor._id}`, result.value);
          if (res.data.success) {
            Swal.fire({
              title: 'সফল!',
              text: 'দাতার তথ্য আপডেট করা হয়েছে',
              icon: 'success',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: '#1e90c9',
            });
            fetchData();
          }
        } catch (err) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: err.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        }
      }
    });
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<strong>"${name}"</strong> দাতাকে মুছে ফেলবেন?<br/><small>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'bangla-font',
        title: 'bangla-font',
        htmlContainer: 'bangla-font',
        confirmButton: 'bangla-font',
        cancelButton: 'bangla-font'
      }
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/donation/donors/${id}`);
        setDonors(donors.filter(d => d._id !== id));
        setTotalDonors(prev => prev - 1);
        
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'দাতা সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
          customClass: {
            popup: 'bangla-font',
            title: 'bangla-font',
            htmlContainer: 'bangla-font',
            confirmButton: 'bangla-font'
          }
        });
      } catch {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
          customClass: {
            popup: 'bangla-font',
            title: 'bangla-font',
            htmlContainer: 'bangla-font',
            confirmButton: 'bangla-font'
          }
        });
      }
    }
  };

  if (loading) return <Loader />;

  if (showNewDonor) {
    return <NewDonor onBack={() => { setShowNewDonor(false); fetchData(); }} />;
  }

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">দাতার তালিকা</h2>
            <p className="text-gray-600 mt-1">মোট দাতা: <strong className="text-[#1e90c9]">{totalDonors}</strong></p>
          </div>
          <MainButton
            onClick={() => setShowNewDonor(true)}
          >
            <FaPlus /> নতুন দাতা
          </MainButton>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="দাতার নাম বা মোবাইল দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none text-sm"
          >
            <option value="">সব ক্যাটাগরি</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {donors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📋</div>
            <p className="text-gray-500">কোনো দাতা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ক্যাটাগরি</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">দাতার নাম</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">মোবাইল</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরিমাণ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ধরন</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor, i) => (
                  <tr key={donor._id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-[#1e90c9] text-white rounded text-xs font-medium">
                        {donor.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{donor.donorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{donor.mobile}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{donor.regularAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        donor.donationType === 'monthly' ? 'bg-blue-100 text-blue-700' :
                        donor.donationType === 'yearly' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {donor.donationType === 'monthly' ? 'মাসিক' : donor.donationType === 'yearly' ? 'বার্ষিক' : 'এককালীন'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="দান গ্রহণ করুন"
                        >
                          <FaDonate size={14} />
                        </button>
                        <button 
                          onClick={() => handleEdit(donor)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                          title="এডিট"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(donor._id, donor.donorName)}
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

      {/* SweetAlert2 Bangla Font Support */}
      <style jsx>{`
        .bangla-font {
          font-family: 'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', Arial, sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default DonorList;