// src/pages/certificate/CertificateCategory/CertificateCategory.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaLanguage } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import NewForm from './NewForm/NewForm';

const CertificateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/certificate/certificate-category');
      setCategories(res.data.data || []);
    } catch {
      Swal.fire('ত্রুটি!', 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `"${name}" ক্যাটাগরি মুছে ফেলবেন?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/certificate/certificate-category/${id}`);
          Swal.fire('মুছে ফেলা হয়েছে!', '', 'success');
          fetchCategories();
        } catch {
          Swal.fire('ত্রুটি!', 'মুছতে সমস্যা হয়েছে', 'error');
        }
      }
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  if (loading) return <Loader />;

  if (showForm) {
    return <NewForm 
      editingCategory={editingCategory} 
      onBack={() => {
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
      }} 
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-blue-600">সার্টিফিকেট ক্যাটাগরি</h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaPlus /> নতুন ক্যাটাগরি
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">📁</div>
              <p className="text-xl text-gray-500">কোনো ক্যাটাগরি তৈরি করা হয়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="px-4 py-4 text-left rounded-tl-lg">ক্রম</th>
                    <th className="px-4 py-4 text-left">ক্যাটাগরি নাম</th>
                    <th className="px-4 py-4 text-center">
                      <FaLanguage className="inline mr-2" /> ভাষা
                    </th>
                    <th className="px-4 py-4 text-center rounded-tr-lg">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-4 text-lg font-semibold text-blue-700">{cat.name}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-4 py-2 rounded-full text-white font-medium text-sm ${
                          cat.language === 'Bengali' ? 'bg-blue-600' :
                          cat.language === 'English' ? 'bg-blue-500' :
                          cat.language === 'Arabic' ? 'bg-blue-400' :
                          cat.language === 'Hindi' ? 'bg-blue-300' :
                          'bg-blue-200'
                        }`}>
                          {cat.language}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="এডিট করুন"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="ডিলিট করুন"
                          >
                            <FaTrash />
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
    </div>
  );
};

export default CertificateCategory;