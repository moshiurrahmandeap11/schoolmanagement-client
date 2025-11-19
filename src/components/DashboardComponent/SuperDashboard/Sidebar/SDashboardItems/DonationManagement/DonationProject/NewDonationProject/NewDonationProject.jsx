// src/pages/donation/NewDonationProject.jsx
import { useState } from 'react';
import { FaArrowLeft, FaImage, FaSave, FaVideo } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const NewDonationProject = ({ project, onBack }) => {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    image: null,
    videoLink: project?.videoLink || '',
    status: project?.status || 'draft'
  });

const [imagePreview, setImagePreview] = useState(
  project?.image ? `${baseImageURL}${project.image}` : ""
);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim()) {
      Swal.fire('ত্রুটি!', 'প্রজেক্টের নাম আবশ্যক', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('videoLink', form.videoLink);
    formData.append('status', form.status);

    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      if (project?._id) {
        await axiosInstance.put(`/donation/projects/${project._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        Swal.fire('সফল!', 'প্রজেক্ট আপডেট হয়েছে', 'success');
      } else {
        await axiosInstance.post('/donation/projects', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        Swal.fire('সফল!', 'প্রজেক্ট তৈরি হয়েছে', 'success');
      }
      onBack();
    } catch (err) {
      console.error('Error:', err);
      Swal.fire('ত্রুটি!', err.response?.data?.message || 'সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-sm"
            disabled={loading}
          >
            <FaArrowLeft /> ফিরে যান
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {project?._id ? 'প্রজেক্ট এডিট করুন' : 'নতুন প্রজেক্ট তৈরি করুন'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ছবি */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">প্রজেক্টের ছবি</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  disabled={loading}
                />
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#1e90c9] transition">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaImage className="text-2xl text-gray-400" />
                  )}
                </div>
              </label>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setImagePreview(''); 
                    setForm(prev => ({ ...prev, image: null })); 
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* ভিডিও লিংক */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ভিডিও লিংক (YouTube)</label>
            <div className="relative">
              <FaVideo className="absolute left-3 top-2 text-gray-400 text-sm" />
              <input
                type="url"
                value={form.videoLink}
                onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* শিরোনাম */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              প্রজেক্টের শিরোনাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="যেমন: মসজিদ নির্মাণ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              disabled={loading}
              required
            />
          </div>

          {/* বিবরণ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">প্রজেক্টের বিবরণ</label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm({ ...form, description: html })}
              placeholder="বিস্তারিত লিখুন..."
            />
          </div>

          {/* স্ট্যাটাস */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">অবস্থা</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              disabled={loading}
            >
              <option value="draft">ড্রাফট</option>
              <option value="published">প্রকাশিত</option>
              <option value="completed">সম্পন্ন</option>
              <option value="urgent">জরুরী</option>
            </select>
          </div>

          {/* সাবমিট */}
          <div className="flex justify-center pt-4">
            <MainButton
              type="submit"
              disabled={loading}
            >
              <FaSave /> 
              {loading ? 'সংরক্ষণ হচ্ছে...' : (project?._id ? 'আপডেট করুন' : 'প্রজেক্ট তৈরি করুন')}
            </MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDonationProject;