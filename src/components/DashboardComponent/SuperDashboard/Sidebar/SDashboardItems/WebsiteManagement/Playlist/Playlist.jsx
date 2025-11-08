import { useEffect, useState } from 'react';
import { FaEdit, FaMusic, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import AddNewPlaylist from './AddNewPlaylist/AddNewPlaylist';


const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingPlaylist, setEditingPlaylist] = useState(null);

    // Fetch playlists
    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/playlists');
            
            if (response.data.success) {
                setPlaylists(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'প্লেলিস্ট লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
            showSweetAlert('error', 'প্লেলিস্ট লোড করতে সমস্যা হয়েছে: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleAddNew = () => {
        setEditingPlaylist(null);
        setActiveTab('new');
    };

    const handleEdit = (playlist) => {
        setEditingPlaylist(playlist);
        setActiveTab('new');
    };

    const handleDelete = async (playlistId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: "আপনি কি এই প্লেলিস্টটি মুছে ফেলতে চান?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'না',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/playlists/${playlistId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'প্লেলিস্ট সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchPlaylists();
                } else {
                    showSweetAlert('error', response.data.message || 'প্লেলিস্ট মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting playlist:', error);
                const errorMessage = error.response?.data?.message || 'প্লেলিস্ট মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingPlaylist(null);
        fetchPlaylists();
    };

    // If activeTab is 'new', show AddNewPlaylist component
    if (activeTab === 'new') {
        return (
            <AddNewPlaylist 
                editingPlaylist={editingPlaylist}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddNew}
                            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 text-sm"
                        >
                            <FaPlus className="text-sm" />
                            নতুন প্লেলিস্ট
                        </button>
                    </div>

                    {/* Playlists List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">প্লেলিস্ট লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && playlists.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🎵</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন প্লেলিস্ট পাওয়া যায়নি</h3>
                                <p className="text-gray-600 mb-4 text-sm">আপনার প্রথম প্লেলিস্ট তৈরি করুন।</p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    প্লেলিস্ট তৈরি করুন
                                </button>
                            </div>
                        )}

                        {/* Playlists Table */}
                        {!loading && playlists.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">প্লেলিস্ট নাম</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন্স</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {playlists.map((playlist) => (
                                            <tr key={playlist._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaMusic className="text-purple-600 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{playlist.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                তৈরি: {new Date(playlist.createdAt).toLocaleDateString('bn-BD')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(playlist)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(playlist._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            ডিলিট
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

                    {/* Summary */}
                    {playlists.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            মোট প্লেলিস্ট: {playlists.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playlist;