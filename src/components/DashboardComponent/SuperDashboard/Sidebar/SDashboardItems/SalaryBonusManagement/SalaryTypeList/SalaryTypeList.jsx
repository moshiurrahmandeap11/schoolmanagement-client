import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import CreateSalaryType from '../CreateSalaryType/CreateSalaryType';


const SalaryTypeList = () => {
    const [salaryTypes, setSalaryTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSalaryType, setEditingSalaryType] = useState(null);

    // Fetch salary types
    useEffect(() => {
        fetchSalaryTypes();
    }, []);

    const fetchSalaryTypes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/salary-types');
            
            if (response.data.success) {
                setSalaryTypes(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load salary types');
            }
        } catch (error) {
            console.error('Error fetching salary types:', error);
            showSweetAlert('error', 'Failed to load salary types list: ' + error.message);
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

    // Edit salary type
    const handleEdit = (salaryType) => {
        setEditingSalaryType(salaryType);
        setShowCreateForm(true);
    };

    // Delete salary type
    const handleDelete = async (salaryTypeId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/salary-types/${salaryTypeId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Salary type deleted successfully!');
                    fetchSalaryTypes();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete salary type');
                }
            } catch (error) {
                console.error('Error deleting salary type:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete salary type';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    // Toggle salary type status
    const handleToggleStatus = async (salaryTypeId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/salary-types/${salaryTypeId}/toggle`);

            if (response.data.success) {
                showSweetAlert('success', `Salary type ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                fetchSalaryTypes();
            } else {
                showSweetAlert('error', response.data.message || 'Failed to update salary type status');
            }
        } catch (error) {
            console.error('Error toggling salary type status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update salary type status';
            showSweetAlert('error', errorMessage);
        }
    };

    // Handle form close
    const handleFormClose = () => {
        setShowCreateForm(false);
        setEditingSalaryType(null);
        fetchSalaryTypes();
    };

    // Format amount with commas
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-BD').format(amount);
    };

    // Truncate description for table view
    const truncateDescription = (description, length = 50) => {
        if (!description) return 'N/A';
        return description.length > length ? description.substring(0, length) + '...' : description;
    };

    // If showCreateForm is true, render CreateSalaryType component
    if (showCreateForm) {
        return (
            <CreateSalaryType 
                editingSalaryType={editingSalaryType}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="max-w-full mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <MainButton
                    onClick={() => setShowCreateForm(true)}
                >
                    <span>+</span>
                    বেতনের ধরণ
                </MainButton>
            </div>

            {/* Salary Types List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Loading State */}
                {loading && (
                    <Loader></Loader>
                )}

                {/* Empty State */}
                {!loading && salaryTypes.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Salary Types Found</h3>
                        <p className="text-gray-600 mb-4">Get started by creating your first salary type.</p>
                        <MainButton
                            onClick={() => setShowCreateForm(true)}
                            
                        >
                            Create Salary Type
                        </MainButton>
                    </div>
                )}

                {/* Salary Types Table */}
                {!loading && salaryTypes.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">সেশন</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">পরিমাণ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">স্ট্যাটাস</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {salaryTypes.map((salaryType) => (
                                    <tr key={salaryType._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{salaryType.salaryName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        salaryType.isMonthly 
                                                            ? 'bg-[#1e90c9] text-white'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {salaryType.isMonthly ? 'Monthly' : 'One-time'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {salaryType.session}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-800">
                                                ৳{formatAmount(salaryType.amount)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                            <div 
                                                className="truncate"
                                                title={salaryType.description}
                                            >
                                                {truncateDescription(salaryType.description)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(salaryType._id, salaryType.isActive)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                    salaryType.isActive
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {salaryType.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(salaryType)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                                >
                                                    এডিট
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(salaryType._id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                                >
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
            {salaryTypes.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-4">
                        <span>Total Salary Types: {salaryTypes.length}</span>
                        <span>Active: {salaryTypes.filter(st => st.isActive).length}</span>
                        <span>Monthly: {salaryTypes.filter(st => st.isMonthly).length}</span>
                        <span>One-time: {salaryTypes.filter(st => !st.isMonthly).length}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryTypeList;