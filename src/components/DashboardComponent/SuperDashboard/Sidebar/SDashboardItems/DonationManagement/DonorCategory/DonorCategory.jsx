import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setEditorKey(prev => prev + 1);
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ক্যাটাগরির নাম আবশ্যক!',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb', // Blue-600
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        name: name.trim(), 
        description: description || ''
      };
      let res;
      if (category) {
        res = await axiosInstance.put(`/donation/categories/${category._id}`, payload);
      } else {
        res = await axiosInstance.post('/donation/categories', payload);
      }
      if (res.data.success) {
        Swal.fire({
          title: 'সফল!',
          text: category ? 'ক্যাটাগরি আপডেট করা হয়েছে!' : 'ক্যাটাগরি তৈরি করা হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb', // Blue-600
        });
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.response?.data?.message || 'সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb', // Blue-600
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {category ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            type="button"
          >
            <FaTimes className="text-xl text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ক্যাটাগরির নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent outline-none transition"
              placeholder="যেমন: সাধারণ দাতা"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              বিবরণ (ঐচ্ছিক)
            </label>
            <RichTextEditor
              key={editorKey}
              value={description || ''}
              onChange={setDescription}
              placeholder="বিবরণ লিখুন..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              বাতিল
            </button>
            <MainButton
              type="submit"
              disabled={loading}
              className='rounded-md'
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : category ? 'আপডেট করুন' : 'যোগ করুন'}
            </MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

const DonorCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/donation/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#1e90c9', // Blue-600
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSuccess = (newCategory) => {
    if (editingCategory) {
      setCategories(categories.map(c => c._id === newCategory._id ? newCategory : c));
    } else {
      setCategories([newCategory, ...categories]);
    }
    setEditingCategory(null);
    setModalOpen(false);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<strong>"${name}"</strong> ক্যাটাগরি মুছে ফেলবেন?<br/><small>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#1e90c9',
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
        await axiosInstance.delete(`/donation/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
        
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          text: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#1e90c9', 
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
          confirmButtonColor: '#2563eb', // Blue-600
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

  const openModal = (category = null) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="max-w-full mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">দাতা ক্যাটাগরি</h2>
              <p className="text-gray-600 mt-1">মোট: <strong className="text-[#1e90c9]">{categories.length}</strong> টি</p>
            </div>
            <MainButton
              onClick={() => openModal()}
              type="button"
            >
              <FaPlus /> নতুন ক্যাটাগরি
            </MainButton>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl text-gray-200 mb-6">Empty</div>
              <p className="text-2xl text-gray-500">এখনো কোনো ক্যাটাগরি তৈরি হয়নি</p>
              <MainButton
                onClick={() => openModal()}
                type="button"
              >
                প্রথম ক্যাটাগরি যোগ করুন
              </MainButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="group bg-[#1e90c9]/10 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{cat.name}</h3>
                  {cat.description ? (
                    <div
                      className="text-gray-600 text-sm prose prose-sm max-w-none line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: cat.description }}
                    />
                  ) : (
                    <p className="text-gray-500 italic text-sm">কোনো বিবরণ নেই</p>
                  )}
                  <div className="mt-6 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(cat)}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                      title="এডিট"
                      type="button"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                      title="ডিলিট"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={handleSuccess}
      />

      {/* SweetAlert2 Bangla Font Support */}
      <style jsx>{`
        .bangla-font {
          font-family: 'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', Arial, sans-serif !important;
        }
      `}</style>
    </>
  );
};

export default DonorCategory;