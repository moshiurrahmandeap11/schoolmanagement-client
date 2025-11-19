import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddMenu from './AddMenu/AddMenu';

const Menu = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingMenu, setEditingMenu] = useState(null);

    // Fetch menus
    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/menus');
            
            if (response.data.success) {
                setMenus(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'মেনু লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching menus:', error);
            showSweetAlert('error', 'মেনু লোড করতে সমস্যা হয়েছে: ' + error.message);
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
        setEditingMenu(null);
        setActiveTab('new');
    };

    const handleEdit = (menu) => {
        setEditingMenu(menu);
        setActiveTab('new');
    };

    const handleDelete = async (menuId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: "আপনি কি এই মেনুটি মুছে ফেলতে চান?",
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
                const response = await axiosInstance.delete(`/menus/${menuId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'মেনু সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchMenus();
                } else {
                    showSweetAlert('error', response.data.message || 'মেনু মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting menu:', error);
                const errorMessage = error.response?.data?.message || 'মেনু মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingMenu(null);
        fetchMenus();
    };

    // If activeTab is 'new', show AddMenu component
    if (activeTab === 'new') {
        return (
            <AddMenu 
                editingMenu={editingMenu}
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
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus className="text-sm" />
                            নতুন মেনু
                        </MainButton>
                    </div>

                    {/* Menus List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && menus.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📋</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন মেনু পাওয়া যায়নি</h3>
                                <p className="text-gray-600 mb-4 text-sm">আপনার প্রথম মেনু তৈরি করুন।</p>
                                <MainButton
                                    onClick={handleAddNew}
                                >
                                    মেনু তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Menus Table */}
                        {!loading && menus.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">মেনু নাম</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন্স</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {menus.map((menu) => (
                                            <tr key={menu._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                            <span className="text-blue-600 font-semibold text-sm">
                                                                {menu.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{menu.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                তৈরি: {new Date(menu.createdAt).toLocaleDateString('bn-BD')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(menu)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(menu._id)}
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
                    {menus.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            মোট মেনু: {menus.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Menu;