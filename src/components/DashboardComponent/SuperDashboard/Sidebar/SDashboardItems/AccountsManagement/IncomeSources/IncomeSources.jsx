import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewIncomeSources from './AddNewIncomeSources/AddNewIncomeSources';


const IncomeSources = ({ onBack }) => {
    const [incomeSources, setIncomeSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSource, setEditingSource] = useState(null);

    // Fetch all income sources
    const fetchIncomeSources = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/income-sources');
            if (response.data.success) {
                setIncomeSources(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching income sources:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'আয়ের উৎস লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomeSources();
    }, []);

    const handleDelete = async (sourceId, sourceName) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি "${sourceName}" আয়ের উৎসটি ডিলিট করতে চলেছেন!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/income-sources/${sourceId}`);
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ডিলিট করা হয়েছে!',
                        text: 'আয়ের উৎস সফলভাবে ডিলিট করা হয়েছে।',
                        confirmButtonText: 'ঠিক আছে'
                    });
                    fetchIncomeSources(); // Refresh the list
                }
            } catch (error) {
                console.error('Error deleting income source:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: 'আয়ের উৎস ডিলিট করতে সমস্যা হয়েছে!',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        }
    };

    const handleToggleStatus = async (sourceId, sourceName, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/income-sources/${sourceId}/toggle-status`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: `${sourceName} ${currentStatus ? 'নিষ্ক্রিয়' : 'সক্রিয়'} করা হয়েছে।`,
                    confirmButtonText: 'ঠিক আছে'
                });
                fetchIncomeSources(); // Refresh the list
            }
        } catch (error) {
            console.error('Error toggling income source status:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        }
    };

    const handleEdit = (source) => {
        setEditingSource(source);
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingSource(null);
        fetchIncomeSources(); // Refresh the list
    };

    // Strip HTML tags for description preview
    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    if (showAddForm) {
        return (
            <AddNewIncomeSources 
                onBack={handleFormClose}
                editingSource={editingSource}
                onSuccess={handleFormClose}
            />
        );
    }

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">আয়ের উৎস</h2>
                    </div>
                    <MainButton
                        onClick={() => setShowAddForm(true)}
                    >
                        <FaPlus className="text-sm mr-2" />
                        Add Income Source
                    </MainButton>
                </div>
            </div>

            {/* Income Sources Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">লোড হচ্ছে...</span>
                    </div>
                ) : incomeSources.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaPlus className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো আয়ের উৎস নেই</h3>
                        <p className="text-gray-600 mb-4">আপনার প্রথম আয়ের উৎস যোগ করুন</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            + Add Income Source
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        নাম
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        বিবরণ
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        অবস্থা
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        কর্ম
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {incomeSources.map((source) => (
                                    <tr key={source._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`text-sm font-medium ${source.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {source.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900 max-w-md">
                                                {source.description ? (
                                                    <div 
                                                        className={`prose prose-sm max-w-none ${!source.isActive && 'opacity-50'}`}
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: source.description.length > 150 
                                                                ? source.description.substring(0, 150) + '...' 
                                                                : source.description 
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                source.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {source.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(source._id, source.name, source.isActive)}
                                                    className={`p-1 rounded transition duration-200 ${
                                                        source.isActive 
                                                            ? 'text-red-600 hover:text-red-800' 
                                                            : 'text-green-600 hover:text-green-800'
                                                    }`}
                                                    title={source.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                                >
                                                    {source.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(source)}
                                                    className="text-blue-600 hover:text-blue-800 transition duration-200 p-1 rounded"
                                                    title="এডিট করুন"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(source._id, source.name)}
                                                    className="text-red-600 hover:text-red-800 transition duration-200 p-1 rounded"
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
            </div>

            {/* Summary Stats */}
            {incomeSources.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-800 text-sm">মোট আয়ের উৎস</p>
                        <p className="text-2xl font-bold text-green-900">{incomeSources.length}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 text-sm">সক্রিয় উৎস</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {incomeSources.filter(source => source.isActive).length}
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-yellow-800 text-sm">নিষ্ক্রিয় উৎস</p>
                        <p className="text-2xl font-bold text-yellow-900">
                            {incomeSources.filter(source => !source.isActive).length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeSources;