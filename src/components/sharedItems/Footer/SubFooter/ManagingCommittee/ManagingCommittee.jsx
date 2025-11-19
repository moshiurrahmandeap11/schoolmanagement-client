import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../Loader/Loader';

const ManagingCommittee = () => {
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
                // Filter only active members
                const activeMembers = response.data.data.filter(member => member.isActive);
                setMembers(activeMembers);
            } else {
                setError('Failed to load committee members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('Failed to load managing committee');
        } finally {
            setLoading(false);
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

    if (members.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">কোন কমিটি মেম্বার নেই</h3>
                    <p className="text-gray-600">শীঘ্রই কমিটি মেম্বার যোগ করা হবে</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        পরিচালনা কমিটি
                    </h1>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member) => (
                        <div 
                            key={member._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
                        >
                            {/* Member Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={`${baseImageURL}${member.image}`}
                                    alt={member.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/images/avatar-placeholder.png';
                                        e.target.className = 'w-full h-full object-cover bg-gray-200';
                                    }}
                                />
                                <div className="absolute inset-0  bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                            </div>

                            {/* Member Info */}
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {member.name}
                                </h3>
                                
                                <p className="text-[#1e90c9] font-semibold text-lg mb-3">
                                    {member.designation}
                                </p>
                                
                                {member.phone && (
                                    <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {member.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Members Count */}
                <div className="text-center mt-8">
                    <p className="text-gray-600 text-sm">
                        মোট {members.length} জন কমিটি মেম্বার
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagingCommittee;