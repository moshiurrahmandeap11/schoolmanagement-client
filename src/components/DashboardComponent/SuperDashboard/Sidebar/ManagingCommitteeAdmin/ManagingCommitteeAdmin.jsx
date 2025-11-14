import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Loader from '../../../../../components/sharedItems/Loader/Loader';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import AddNewCommitteeMember from './AddNewCommitteeMember/AddNewCommitteeMember';

const ManagingCommitteeAdmin = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

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

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingMember(null);
        fetchMembers(); // Refresh list
    };

    // Handle edit member
    const handleEditMember = (member) => {
        setEditingMember(member);
        setShowAddForm(true);
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

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <AddNewCommitteeMember 
                member={editingMember}
                onClose={handleFormClose}
            />
        );
    }

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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                পরিচালনা কমিটি ম্যানেজমেন্ট
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                সকল কমিটি মেম্বার ব্যবস্থাপনা
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন মেম্বার</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {members.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">👥</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন কমিটি মেম্বার নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন কমিটি মেম্বার যোগ করা হয়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    প্রথম মেম্বার যোগ করুন
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {members.map((member) => (
                                    <div key={member._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
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
                                            
                                            {/* Description Preview */}
                                            {member.description && (
                                                <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    <div 
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: member.description.length > 100 
                                                                ? member.description.substring(0, 100) + '...' 
                                                                : member.description 
                                                        }} 
                                                    />
                                                </div>
                                            )}
                                            
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
                        )}

                        {/* Summary */}
                        {members.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                                        <div className="text-gray-600">মোট মেম্বার</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {members.filter(member => member.isActive).length}
                                        </div>
                                        <div className="text-gray-600">সক্রিয় মেম্বার</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {members.filter(member => !member.isActive).length}
                                        </div>
                                        <div className="text-gray-600">নিষ্ক্রিয় মেম্বার</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagingCommitteeAdmin;