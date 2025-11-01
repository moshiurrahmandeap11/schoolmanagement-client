import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../components/sharedItems/Loader/Loader';

const ManagingCommitteeAdmin = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/managing-committee');
            
            if (response.data.success) {
                setMembers(response.data.data || []);
            } else {
                setError('Failed to load committee members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('Failed to load managing committee members');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'নতুন কমিটি মেম্বার যোগ করুন',
            html: `
                <div class="text-left space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">নাম *</label>
                        <input 
                            id="memberName" 
                            class="swal2-input w-full" 
                            placeholder="পূর্ণ নাম লিখুন"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">পদবী *</label>
                        <input 
                            id="memberDesignation" 
                            class="swal2-input w-full" 
                            placeholder="পদবী লিখুন"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                        <input 
                            id="memberPhone" 
                            class="swal2-input w-full" 
                            placeholder="০১XXXXXXXXX"
                            type="tel"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ছবি *</label>
                        <input 
                            type="file" 
                            id="memberImage" 
                            class="w-full p-2 border border-gray-300 rounded"
                            accept="image/*"
                        >
                        <p class="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max: 2MB)</p>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'যোগ করুন',
            cancelButtonText: 'বাতিল করুন',
            preConfirm: () => {
                const name = document.getElementById('memberName').value;
                const designation = document.getElementById('memberDesignation').value;
                const phone = document.getElementById('memberPhone').value;
                const image = document.getElementById('memberImage').files[0];

                if (!name.trim()) {
                    Swal.showValidationMessage('নাম প্রয়োজন');
                    return false;
                }
                if (!designation.trim()) {
                    Swal.showValidationMessage('পদবী প্রয়োজন');
                    return false;
                }
                if (!image) {
                    Swal.showValidationMessage('ছবি প্রয়োজন');
                    return false;
                }

                // Phone validation (optional)
                if (phone && !/^(?:\+88|01)?\d{9,11}$/.test(phone)) {
                    Swal.showValidationMessage('সঠিক ফোন নম্বর দিন');
                    return false;
                }

                return { name, designation, phone, image };
            }
        });

        if (formValues) {
            try {
                const formData = new FormData();
                formData.append('name', formValues.name);
                formData.append('designation', formValues.designation);
                formData.append('phone', formValues.phone || '');
                formData.append('image', formValues.image);

                const response = await axiosInstance.post('/managing-committee', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    Swal.fire('Success!', 'কমিটি মেম্বার সফলভাবে যোগ হয়েছে', 'success');
                    fetchMembers();
                }
            } catch (error) {
                console.error('Error adding member:', error);
                Swal.fire('Error!', 'কমিটি মেম্বার যোগ করতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const handleEditMember = async (member) => {
        const { value: formValues } = await Swal.fire({
            title: 'কমিটি মেম্বার এডিট করুন',
            html: `
                <div class="text-left space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">নাম *</label>
                        <input 
                            id="memberName" 
                            class="swal2-input w-full" 
                            placeholder="পূর্ণ নাম লিখুন"
                            value="${member.name}"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">পদবী *</label>
                        <input 
                            id="memberDesignation" 
                            class="swal2-input w-full" 
                            placeholder="পদবী লিখুন"
                            value="${member.designation}"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                        <input 
                            id="memberPhone" 
                            class="swal2-input w-full" 
                            placeholder="০১XXXXXXXXX"
                            value="${member.phone || ''}"
                            type="tel"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ছবি</label>
                        <input 
                            type="file" 
                            id="memberImage" 
                            class="w-full p-2 border border-gray-300 rounded"
                            accept="image/*"
                        >
                        <p class="text-xs text-gray-500 mt-1">বর্তমান ছবি: ${member.image}</p>
                        <p class="text-xs text-gray-500">নতুন ছবি দিতে চাইলে আপলোড করুন</p>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'আপডেট করুন',
            cancelButtonText: 'বাতিল করুন',
            preConfirm: () => {
                const name = document.getElementById('memberName').value;
                const designation = document.getElementById('memberDesignation').value;
                const phone = document.getElementById('memberPhone').value;
                const image = document.getElementById('memberImage').files[0];

                if (!name.trim()) {
                    Swal.showValidationMessage('নাম প্রয়োজন');
                    return false;
                }
                if (!designation.trim()) {
                    Swal.showValidationMessage('পদবী প্রয়োজন');
                    return false;
                }

                // Phone validation (optional)
                if (phone && !/^(?:\+88|01)?\d{9,11}$/.test(phone)) {
                    Swal.showValidationMessage('সঠিক ফোন নম্বর দিন');
                    return false;
                }

                return { name, designation, phone, image };
            }
        });

        if (formValues) {
            try {
                const formData = new FormData();
                formData.append('name', formValues.name);
                formData.append('designation', formValues.designation);
                formData.append('phone', formValues.phone || '');
                if (formValues.image) {
                    formData.append('image', formValues.image);
                }

                const response = await axiosInstance.put(`/managing-committee/${member._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    Swal.fire('Success!', 'কমিটি মেম্বার সফলভাবে আপডেট হয়েছে', 'success');
                    fetchMembers();
                }
            } catch (error) {
                console.error('Error updating member:', error);
                Swal.fire('Error!', 'কমিটি মেম্বার আপডেট করতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const handleDeleteMember = async (memberId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত করুন',
            text: 'আপনি কি এই কমিটি মেম্বার ডিলিট করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'না'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/managing-committee/${memberId}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'কমিটি মেম্বার ডিলিট হয়েছে', 'success');
                    fetchMembers();
                }
            } catch (error) {
                console.error('Error deleting member:', error);
                Swal.fire('Error!', 'কমিটি মেম্বার ডিলিট করতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const handleToggleStatus = async (memberId) => {
        try {
            const response = await axiosInstance.patch(`/managing-committee/${memberId}/toggle`);
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                fetchMembers();
            }
        } catch (error) {
            console.error('Error toggling member status:', error);
            Swal.fire('Error!', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে', 'error');
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">লোড করতে সমস্যা</h3>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchMembers}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                        আবার চেষ্টা করুন
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">পরিচালনা কমিটি ম্যানেজমেন্ট</h1>
                    <button
                        onClick={handleAddMember}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <span>+</span>
                        নতুন মেম্বার যোগ করুন
                    </button>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member) => (
                        <div key={member._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Member Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={`${baseImageURL}${member.image}`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/images/avatar-placeholder.png';
                                        e.target.className = 'w-full h-full object-cover bg-gray-200';
                                    }}
                                />
                                
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        member.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Member Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                                    {member.name}
                                </h3>
                                <p className="text-blue-600 font-semibold mb-2 truncate">
                                    {member.designation}
                                </p>
                                {member.phone && (
                                    <p className="text-gray-600 text-sm mb-3">
                                        📞 {member.phone}
                                    </p>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                                    >
                                        এডিট
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(member._id)}
                                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                    >
                                        {member.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMember(member._id)}
                                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                    >
                                        ডিলিট
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">কোন কমিটি মেম্বার নেই</h3>
                        <p className="text-gray-600">নতুন কমিটি মেম্বার যোগ করুন</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagingCommitteeAdmin;