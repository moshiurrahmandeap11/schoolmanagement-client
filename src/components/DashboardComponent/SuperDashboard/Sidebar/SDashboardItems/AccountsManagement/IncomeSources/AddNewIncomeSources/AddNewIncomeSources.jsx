import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewIncomeSources = ({ onBack, editingSource, onSuccess }) => {
    const [incomeSources, setIncomeSources] = useState([
        { name: '', description: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [isBulkAdd, setIsBulkAdd] = useState(false);

    useEffect(() => {
        if (editingSource) {
            setIncomeSources([{
                name: editingSource.name || '',
                description: editingSource.description || ''
            }]);
            setIsBulkAdd(false);
        }
    }, [editingSource]);

    const handleInputChange = (index, field, value) => {
        const updatedSources = [...incomeSources];
        updatedSources[index][field] = value;
        setIncomeSources(updatedSources);
    };

    const addNewSource = () => {
        setIncomeSources([...incomeSources, { name: '', description: '' }]);
    };

    const removeSource = (index) => {
        if (incomeSources.length > 1) {
            const updatedSources = incomeSources.filter((_, i) => i !== index);
            setIncomeSources(updatedSources);
        }
    };

    const handleDescriptionChange = (index, content) => {
        handleInputChange(index, 'description', content);
    };

    const validateForm = () => {
        for (let source of incomeSources) {
            if (!source.name.trim()) {
                return { isValid: false, message: 'সকল আয়ের উৎসের নাম প্রয়োজন' };
            }
        }
        return { isValid: true };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validation = validateForm();
        if (!validation.isValid) {
            Swal.fire({
                icon: 'warning',
                title: 'অপূর্ণ তথ্য',
                text: validation.message,
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (editingSource) {
                // Update existing source
                response = await axiosInstance.put(`/income-sources/${editingSource._id}`, incomeSources[0]);
            } else if (incomeSources.length === 1) {
                // Create single source
                response = await axiosInstance.post('/income-sources', incomeSources[0]);
            } else {
                // Create multiple sources
                response = await axiosInstance.post('/income-sources/bulk', { incomeSources });
            }

            if (response.data.success) {
                let successMessage = '';
                if (editingSource) {
                    successMessage = 'আয়ের উৎস আপডেট করা হয়েছে!';
                } else if (incomeSources.length === 1) {
                    successMessage = 'নতুন আয়ের উৎস যোগ করা হয়েছে!';
                } else {
                    successMessage = `${incomeSources.length}টি আয়ের উৎস যোগ করা হয়েছে!`;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: successMessage,
                    confirmButtonText: 'ঠিক আছে'
                });
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving income sources:', error);
            const errorMessage = error.response?.data?.message || 'আয়ের উৎস সংরক্ষণ করতে সমস্যা হয়েছে!';
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: errorMessage,
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleBulkAdd = () => {
        if (!isBulkAdd && !editingSource) {
            setIncomeSources([...incomeSources, { name: '', description: '' }]);
        } else if (isBulkAdd && incomeSources.length > 1) {
            setIncomeSources([incomeSources[0]]);
        }
        setIsBulkAdd(!isBulkAdd);
    };

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {editingSource ? 'আয়ের উৎস এডিট করুন' : 'নতুন আয়ের উৎস যোগ করুন'}
                        </h2>
                        <p className="text-gray-600">
                            {editingSource 
                                ? 'আপনার আয়ের উৎসের তথ্য আপডেট করুন' 
                                : 'প্রতিষ্ঠানের নতুন আয়ের উৎস যোগ করুন (ফি, ডোনেশন, সার্ভিস চার্জ ইত্যাদি)'}
                        </p>
                    </div>
                </div>

                {/* Bulk Add Toggle */}
                {!editingSource && (
                    <div className="flex items-center justify-between mt-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                            <p className="text-blue-800 font-medium">একাধিক উৎস যোগ করুন</p>
                            <p className="text-blue-600 text-sm">একসাথে অনেকগুলো আয়ের উৎস যোগ করতে এই অপশনটি ব্যবহার করুন</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleBulkAdd}
                            className={`px-4 py-2 rounded-lg transition duration-200 ${
                                isBulkAdd 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            {isBulkAdd ? 'সিঙ্গেল মোড' : 'বাল্ক মোড'}
                        </button>
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-8">
                        {incomeSources.map((source, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-6 relative">
                                {/* Remove button for multiple sources */}
                                {incomeSources.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSource(index)}
                                        className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition duration-200"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
                                )}

                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    আয়ের উৎস {incomeSources.length > 1 ? `#${index + 1}` : 'বিস্তারিত'}
                                </h3>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Income Source Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            আয়ের উৎসের নাম *
                                        </label>
                                        <input
                                            type="text"
                                            value={source.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                                            placeholder="যেমন: শিক্ষার্থী ফি, ডোনেশন, পরীক্ষা ফি, সার্ভিস চার্জ"
                                        />
                                    </div>

                                    {/* Description with Rich Text Editor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            বিবরণ
                                        </label>
                                        <RichTextEditor
                                            value={source.description}
                                            onChange={(content) => handleDescriptionChange(index, content)}
                                            placeholder="আয়ের উৎস সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                                            height="200px"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add More Button (for bulk mode) */}
                    {isBulkAdd && !editingSource && (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={addNewSource}
                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 flex items-center gap-2"
                            >
                                <FaPlus className="text-sm" />
                                আরও যোগ করুন
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <FaSave className="text-sm" />
                            {loading ? (
                                'সংরক্ষণ হচ্ছে...'
                            ) : editingSource ? (
                                'আপডেট করুন'
                            ) : incomeSources.length > 1 ? (
                                `সবগুলো সংরক্ষণ করুন (${incomeSources.length})`
                            ) : (
                                'সংরক্ষণ করুন'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                        >
                            বাতিল করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewIncomeSources;