import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const UserSettings = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/users');
            
            if (response.data?.success) {
                setUsers(response.data.data || []);
            } else {
                Swal.fire('Error!', 'ইউজার লোড করতে সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error!', 'ইউজার লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Update user role
    const updateUserRole = async (userId, newRole) => {
        try {
            setUpdating(true);
            
            const response = await axiosInstance.put(`/users/${userId}`, {
                role: newRole
            });

            if (response.data?.success) {
                Swal.fire('Success!', `ইউজার ${newRole} তে আপডেট হয়েছে`, 'success');
                // Refresh users list
                fetchUsers();
            } else {
                Swal.fire('Error!', response.data?.message || 'আপডেট করতে সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            Swal.fire('Error!', 'ইউজার আপডেট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Handle role update confirmation
    const handleRoleUpdate = (user, newRole) => {
        Swal.fire({
            title: 'নিশ্চিত করুন?',
            html: `আপনি কি <strong>${user.fullName || user.email}</strong> কে <strong>${newRole}</strong> তে আপডেট করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ, আপডেট করুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                updateUserRole(user._id, newRole);
            }
        });
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'moderator':
                return 'bg-purple-100 text-purple-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get role display name
    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin':
                return 'অ্যাডমিন';
            case 'moderator':
                return 'মডারেটর';
            case 'user':
                return 'ইউজার';
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            ইউজার ব্যবস্থাপনা
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            সকল ইউজার দেখুন এবং ব্যবস্থাপনা করুন
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">মোট ইউজার</p>
                                        <p className="text-2xl font-bold text-blue-800">{users.length}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">সাধারণ ইউজার</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {users.filter(user => user.role === 'user').length}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-600 text-sm font-medium">মডারেটর</p>
                                        <p className="text-2xl font-bold text-purple-800">
                                            {users.filter(user => user.role === 'moderator').length}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">অ্যাডমিন</p>
                                        <p className="text-2xl font-bold text-red-800">
                                            {users.filter(user => user.role === 'admin').length}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ইউজার
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ইমেইল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            রোল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            যোগদানের তারিখ
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            কাজ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {(user.fullName || user.email).charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.fullName || 'নাম নেই'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.displayName || 'ডিসপ্লে নেইম নেই'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleDisplayName(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.createdAt ? formatDate(user.createdAt) : 'তারিখ নেই'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {user.role === 'user' && (
                                                        <button
                                                            onClick={() => handleRoleUpdate(user, 'moderator')}
                                                            disabled={updating}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            {updating ? (
                                                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : null}
                                                            মডারেটর করুন
                                                        </button>
                                                    )}
                                                    {user.role === 'moderator' && (
                                                        <button
                                                            onClick={() => handleRoleUpdate(user, 'user')}
                                                            disabled={updating}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                        >
                                                            {updating ? (
                                                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : null}
                                                            ইউজার করুন
                                                        </button>
                                                    )}
                                                    {/* Admin users cannot be demoted for safety */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {users.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ইউজার নেই</h3>
                                <p className="text-gray-500">এখনও কোন ইউজার রেজিস্টার হয়নি</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;