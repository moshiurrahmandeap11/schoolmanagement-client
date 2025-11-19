import { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewDocumentCategory = ({ editingCategory, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([
        { name: '', description: '' }
    ]);

    useEffect(() => {
        if (editingCategory) {
            // For editing, show only one category
            setCategories([{
                name: editingCategory.name || '',
                description: editingCategory.description || ''
            }]);
        }
    }, [editingCategory]);

    const handleInputChange = (index, field, value) => {
        const updatedCategories = [...categories];
        updatedCategories[index][field] = value;
        setCategories(updatedCategories);
    };

    const addCategoryField = () => {
        setCategories([...categories, { name: '', description: '' }]);
    };

    const removeCategoryField = (index) => {
        if (categories.length > 1) {
            const updatedCategories = categories.filter((_, i) => i !== index);
            setCategories(updatedCategories);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all categories
        for (let i = 0; i < categories.length; i++) {
            if (!categories[i].name.trim()) {
                Swal.fire('Error!', `ক্যাটাগরী ${i + 1} এর নাম আবশ্যক`, 'error');
                return;
            }
        }

        setLoading(true);

        try {
            let response;
            if (editingCategory) {
                // Update single category
                response = await axiosInstance.put(`/document-categories/${editingCategory._id}`, categories[0]);
            } else {
                // Create multiple categories
                response = await axiosInstance.post('/document-categories', { categories });
            }

            if (response.data.success) {
                Swal.fire('Success!', 
                    editingCategory ? 'ক্যাটাগরী সফলভাবে আপডেট হয়েছে' : response.data.message, 
                    'success'
                );
                onBack();
            }
        } catch (error) {
            console.error('Error saving categories:', error);
            const errorMessage = error.response?.data?.message || 
                (editingCategory ? 'ক্যাটাগরী আপডেট করতে সমস্যা হয়েছে' : 'ক্যাটাগরী তৈরি করতে সমস্যা হয়েছে');
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
                            {editingCategory ? 'ক্যাটাগরী এডিট করুন' : 'নতুন ডকুমেন্ট ক্যাটাগরী তৈরি করুন'}
                        </h1>
                        <button
                            onClick={onBack}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
                        >
                            ক্যাটাগরী তালিকায় ফিরে যান
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dynamic Category Fields */}
                        {categories.map((category, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        ক্যাটাগরী {index + 1}
                                    </h3>
                                    {categories.length > 1 && !editingCategory && (
                                        <button
                                            type="button"
                                            onClick={() => removeCategoryField(index)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                        >
                                            <FaMinus className="text-sm" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Category Name */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            ক্যাটাগরী নাম <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={category.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                            placeholder="ক্যাটাগরীর নাম লিখুন"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            বিবরণ
                                        </label>
                                        <textarea
                                            value={category.description}
                                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                            placeholder="ক্যাটাগরীর সংক্ষিপ্ত বিবরণ লিখুন (ঐচ্ছিক)"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Button (only for new categories, not editing) */}
                        {!editingCategory && (
                            <MainButton
                                type="button"
                                onClick={addCategoryField}
                            >
                                <FaPlus className="text-sm" />
                                আরও যোগ করুন
                            </MainButton>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <MainButton
                                type="submit"
                                className='flex-1 flex items-center justify-center rounded-md'
                                disabled={loading}
                            >
                                {loading 
                                    ? (editingCategory ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...') 
                                    : (editingCategory ? 'ক্যাটাগরী আপডেট করুন' : 'ক্যাটাগরী তৈরি করুন')
                                }
                            </MainButton>
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium text-lg transition-colors"
                            >
                                বাতিল করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewDocumentCategory;