import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';


const AddNewPlaylist = ({ editingPlaylist, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        if (editingPlaylist) {
            setName(editingPlaylist.name || '');
        }
    }, [editingPlaylist]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            Swal.fire('Error!', 'প্লেলিস্ট নাম আবশ্যক', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            const playlistData = { name: name.trim() };
            
            if (editingPlaylist) {
                response = await axiosInstance.put(`/playlists/${editingPlaylist._id}`, playlistData);
            } else {
                response = await axiosInstance.post('/playlists', playlistData);
            }

            if (response.data.success) {
                Swal.fire('Success!', 
                    editingPlaylist ? 'প্লেলিস্ট সফলভাবে আপডেট হয়েছে' : 'প্লেলিস্ট সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                onBack();
            }
        } catch (error) {
            console.error('Error saving playlist:', error);
            const errorMessage = error.response?.data?.message || 
                (editingPlaylist ? 'প্লেলিস্ট আপডেট করতে সমস্যা হয়েছে' : 'প্লেলিস্ট তৈরি করতে সমস্যা হয়েছে');
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editingPlaylist ? 'প্লেলিস্ট এডিট করুন' : 'নতুন প্লেলিস্ট তৈরি করুন'}
                        </h1>
                        <button
                            onClick={onBack}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
                        >
                            প্লেলিস্ট তালিকায় ফিরে যান
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Playlist Name - Only Field */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                প্লেলিস্ট নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="প্লেলিস্টের নাম লিখুন"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading 
                                    ? (editingPlaylist ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...') 
                                    : (editingPlaylist ? 'প্লেলিস্ট আপডেট করুন' : 'প্লেলিস্ট তৈরি করুন')
                                }
                            </button>
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium text-lg transition-colors"
                            >
                                বাতিল করুন
                            </button>
                        </div>
                    </form>

                    {/* Simple Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            • প্লেলিস্ট নাম অবশ্যই অনন্য হতে হবে
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewPlaylist;