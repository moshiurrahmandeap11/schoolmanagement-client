import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewContact from './AddNewContact/AddNewContact';


const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingContact, setEditingContact] = useState(null);

    // Fetch contacts
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin-contact');
            
            if (response.data.success) {
                setContacts(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showSweetAlert('error', 'Failed to load contacts: ' + error.message);
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
        setEditingContact(null);
        setActiveTab('new');
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setActiveTab('new');
    };

    const handleDelete = async (contactId) => {
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
                const response = await axiosInstance.delete(`/admin-contact/${contactId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Contact deleted successfully!');
                    fetchContacts();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete contact');
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete contact';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingContact(null);
        fetchContacts();
    };

    // If activeTab is 'new', show AddNewContact component
    if (activeTab === 'new') {
        return (
            <AddNewContact 
                editingContact={editingContact}
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
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                            যোগাযোগ ব্যবস্থাপনা
                        </h1>
                        <p className="text-gray-600 text-lg">
                            আপনার প্রতিষ্ঠানের সকল যোগাযোগ তথ্য নিয়ন্ত্রণ করুন
                        </p>
                    </div>

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddNew}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                        >
                            <FaPlus />
                            নতুন কন্টাক্ট
                        </button>
                    </div>

                    {/* Contacts List */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Loading contacts...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && contacts.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">📞</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Contacts Found</h3>
                                <p className="text-gray-600 mb-4">Get started by adding your first contact information.</p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add Contact
                                </button>
                            </div>
                        )}

                        {/* Contacts Table */}
                        {!loading && contacts.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">যোগাযোগ করুন</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">মোবাইল</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ইমেইল</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">থানা/জেলা</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {contacts.map((contact) => (
                                            <tr key={contact._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{contact.contactTitle}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{contact.address}</p>
                                                        {contact.postOffice && (
                                                            <p className="text-sm text-gray-500">পোস্ট অফিস: {contact.postOffice}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-600">
                                                        {contact.mobile}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-600">
                                                        {contact.email || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-600">
                                                        {contact.thanaDistrict || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(contact)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(contact._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm flex items-center gap-1"
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
                    {contacts.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Contacts: {contacts.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;