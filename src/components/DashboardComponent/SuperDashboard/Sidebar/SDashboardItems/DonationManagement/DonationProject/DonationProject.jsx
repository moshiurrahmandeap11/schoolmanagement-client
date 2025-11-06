// src/pages/donation/DonationProject.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import NewDonationProject from './NewDonationProject/NewDonationProject';

const DonationProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get('/donation/projects');
      setProjects(res.data.data || []);
    } catch  {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'প্রজেক্ট লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<strong>"${name}"</strong> প্রজেক্ট মুছে ফেলবেন?<br/><small>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/donation/projects/${id}`);
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'প্রজেক্ট সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
          fetchProjects();
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
    });
  };

  if (loading) return <Loader />;

  if (showForm) {
    return <NewDonationProject
      project={editingProject}
      onBack={() => {
        setShowForm(false);
        setEditingProject(null);
        fetchProjects();
      }}
    />;
  }

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">অনুদান প্রজেক্টসমূহ</h2>
            <p className="text-gray-600 mt-1">মোট: <strong className="text-blue-600">{projects.length}</strong> টি</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <FaPlus /> নতুন প্রজেক্ট
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📋</div>
            <p className="text-gray-500">কোনো প্রজেক্ট নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(proj => (
              <div key={proj._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                {proj.image && (
                  <img 
                    src={`${baseImageURL}${proj.image}`} 
                    alt={proj.name} 
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-1">{proj.name}</h3>
                  <div 
                    className="text-gray-600 text-sm mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: proj.description || 'কোনো বিবরণ নেই' }} 
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      proj.status === 'published' ? 'bg-green-100 text-green-700' :
                      proj.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      proj.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {proj.status === 'draft' ? 'ড্রাফট' :
                       proj.status === 'published' ? 'প্রকাশিত' :
                       proj.status === 'completed' ? 'সম্পন্ন' : 'জরুরী'}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingProject(proj); setShowForm(true); }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        title="এডিট"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(proj._id, proj.name)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        title="ডিলিট"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationProject;