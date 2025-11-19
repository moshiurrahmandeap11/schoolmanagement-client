import { useEffect, useState } from 'react';
import { FaEdit, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewFacilities from './AddNewFacilities/AddNewFacilities';


const Facilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingFacility, setEditingFacility] = useState(null);

    // Fetch facilities
    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/facilities');
            
            if (response.data.success) {
                setFacilities(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load facilities');
            }
        } catch (error) {
            console.error('Error fetching facilities:', error);
            showSweetAlert('error', 'Failed to load facilities: ' + error.message);
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
        setEditingFacility(null);
        setActiveTab('new');
    };

    const handleEdit = (facility) => {
        setEditingFacility(facility);
        setActiveTab('new');
    };

    const handleDelete = async (facilityId) => {
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
                const response = await axiosInstance.delete(`/facilities/${facilityId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Facility deleted successfully!');
                    fetchFacilities();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete facility');
                }
            } catch (error) {
                console.error('Error deleting facility:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete facility';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingFacility(null);
        fetchFacilities();
    };

    // Truncate description for table view
    const truncateDescription = (description, length = 100) => {
        if (!description) return 'No description';
        const cleanDescription = description.replace(/<[^>]*>/g, '');
        return cleanDescription.length > length ? cleanDescription.substring(0, length) + '...' : cleanDescription;
    };

    // If activeTab is 'new', show AddNewFacilities component
    if (activeTab === 'new') {
        return (
            <AddNewFacilities 
                editingFacility={editingFacility}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            সুবিধা ব্যবস্থাপনা
                        </h1>
                    </div>

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus className="text-sm" />
                            নতুন সুবিধা
                        </MainButton>
                    </div>

                    {/* Facilities List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && facilities.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🏫</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Facilities Found</h3>
                                <p className="text-gray-600 mb-4 text-sm">Get started by adding your first facility.</p>
                                <MainButton
                                    onClick={handleAddNew}
                                >
                                    Add Facility
                                </MainButton>
                            </div>
                        )}

                        {/* Facilities Table */}
                        {!loading && facilities.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিরোনাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {facilities.map((facility) => (
                                            <tr key={facility._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        {facility.image ? (
                                                            <img 
                                                                src={`${baseImageURL}${facility.image}`}
                                                                alt={facility.name}
                                                                className="w-12 h-12 rounded-lg object-cover border flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <FaImage className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{facility.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {truncateDescription(facility.description)}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(facility)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(facility._id)}
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
                    {facilities.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Facilities: {facilities.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Facilities;