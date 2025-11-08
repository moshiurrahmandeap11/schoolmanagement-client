import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewPage = ({ editingPage, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        data: ''
    });

    useEffect(() => {
        if (editingPage) {
            setFormData({
                name: editingPage.name || '',
                description: editingPage.description || '',
                data: editingPage.data || ''
            });
        }
    }, [editingPage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.data.trim()) {
            Swal.fire('Error!', 'পৃষ্ঠা নাম এবং কন্টেন্ট আবশ্যক', 'error');
            return;
        }

        setLoading(true);

        try {
            let response;
            if (editingPage) {
                response = await axiosInstance.put(`/pages/${editingPage._id}`, formData);
            } else {
                response = await axiosInstance.post('/pages', formData);
            }

            if (response.data.success) {
                Swal.fire('Success!', 
                    editingPage ? 'পৃষ্ঠা সফলভাবে আপডেট হয়েছে' : 'পৃষ্ঠা সফলভাবে তৈরি হয়েছে', 
                    'success'
                );
                onBack();
            }
        } catch (error) {
            console.error('Error saving page:', error);
            const errorMessage = error.response?.data?.message || 
                (editingPage ? 'পৃষ্ঠা আপডেট করতে সমস্যা হয়েছে' : 'পৃষ্ঠা তৈরি করতে সমস্যা হয়েছে');
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editingPage ? 'পৃষ্ঠা এডিট করুন' : 'নতুন পৃষ্ঠা তৈরি করুন'}
                        </h1>
                        <button
                            onClick={onBack}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
                        >
                            পৃষ্ঠা তালিকায় ফিরে যান
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Page Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                পৃষ্ঠা নাম <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="পৃষ্ঠার নাম লিখুন"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                বিবরণ
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="পৃষ্ঠার সংক্ষিপ্ত বিবরণ লিখুন (ঐচ্ছিক)"
                                rows="3"
                            />
                        </div>

                        {/* Data - Rich Text Editor */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                কন্টেন্ট <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.data}
                                onChange={(content) => setFormData({ ...formData, data: content })}
                                height="400px"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading 
                                    ? (editingPage ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...') 
                                    : (editingPage ? 'পৃষ্ঠা আপডেট করুন' : 'পৃষ্ঠা তৈরি করুন')
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

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">সহায়তা:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• পৃষ্ঠা নাম অবশ্যই অনন্য হতে হবে</li>
                            <li>• কন্টেন্ট Rich Text Editor ব্যবহার করে ফরম্যাট করতে পারবেন</li>
                            <li>• পৃষ্ঠা URL হবে: yourwebsite.com/pages/[page-name]</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewPage;