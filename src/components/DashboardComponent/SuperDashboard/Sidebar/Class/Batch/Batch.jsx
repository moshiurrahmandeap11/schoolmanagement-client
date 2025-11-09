import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSearch, FaTrash, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewBatch from './AddNewBatch/AddNewBatch';


const Batch = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/batches');
            
            if (response.data.success) {
                setBatches(response.data.data);
            } else {
                showSweetAlert('error', 'ব্যাচ লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            showSweetAlert('error', 'ব্যাচ লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        setShowAddForm(true);
    };

    const handleDelete = async (batch) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি "${batch.name}" ব্যাচটি ডিলিট করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'বাতিল করুন',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/batches/${batch._id}`);
                
                if (response.data.success) {
                    showSweetAlert('success', 'ব্যাচ সফলভাবে ডিলিট হয়েছে');
                    fetchBatches();
                } else {
                    showSweetAlert('error', response.data.message);
                }
            } catch (error) {
                console.error('Error deleting batch:', error);
                const errorMessage = error.response?.data?.message || 'ব্যাচ ডিলিট করতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            }
        }
    };

    const handleSuccess = () => {
        setShowAddForm(false);
        setEditingBatch(null);
        fetchBatches();
    };

    const handleBack = () => {
        setShowAddForm(false);
        setEditingBatch(null);
    };

    // Filter batches based on search term
    const filteredBatches = batches.filter(batch =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.class && batch.class.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (showAddForm) {
        return (
            <AddNewBatch 
                onBack={handleBack}
                onSuccess={handleSuccess}
                editData={editingBatch}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <FaUsers className="text-2xl text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            ব্যাচ ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus className="text-sm" />
                        নতুন ব্যাচ
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    সকল ব্যাচ
                                </h2>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ব্যাচ, আইডি বা ক্লাস দ্বারা খুঁজুন..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batches Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
                            </div>
                        ) : filteredBatches.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                                <p className="text-gray-600">
                                    {searchTerm ? 'কোন ব্যাচ পাওয়া যায়নি' : 'কোন ব্যাচ পাওয়া যায়নি'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        প্রথম ব্যাচ তৈরি করুন
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যাচের নাম
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যাচ আইডি
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থা
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredBatches.map((batch) => (
                                            <tr key={batch._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {batch.name}
                                                        </span>
                                                    </div>
                                                    {batch.description && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {batch.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {batch.batchId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {batch.class ? batch.class.name : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        batch.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {batch.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(batch)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(batch)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Search Results Info */}
                        {searchTerm && filteredBatches.length > 0 && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    {filteredBatches.length}টি ব্যাচ পাওয়া গেছে "{searchTerm}" এর জন্য
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Batch;