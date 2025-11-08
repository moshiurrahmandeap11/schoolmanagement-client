import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewContact = ({ editingContact, onBack }) => {
    const [formData, setFormData] = useState({
        contactTitle: '',
        mobile: '',
        email: '',
        address: '',
        thanaDistrict: '',
        postOffice: ''
    });
    const [loading, setLoading] = useState(false);

    // Set form data when editing
    useEffect(() => {
        if (editingContact) {
            setFormData({
                contactTitle: editingContact.contactTitle || '',
                mobile: editingContact.mobile || '',
                email: editingContact.email || '',
                address: editingContact.address || '',
                thanaDistrict: editingContact.thanaDistrict || '',
                postOffice: editingContact.postOffice || ''
            });
        }
    }, [editingContact]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.contactTitle.trim() || !formData.mobile.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields (যোগাযোগ করুন, মোবাইল)'
            });
            return;
        }

        // Mobile number validation
        const mobileRegex = /^[0-9]{11}$/;
        if (!mobileRegex.test(formData.mobile)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid 11-digit mobile number'
            });
            return;
        }

        // Email validation (if provided)
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address'
            });
            return;
        }

        try {
            setLoading(true);
            let response;

            if (editingContact) {
                // Update existing contact
                response = await axiosInstance.put(`/admin-contact/${editingContact._id}`, formData);
            } else {
                // Create new contact
                response = await axiosInstance.post('/admin-contact', formData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingContact ? 'Contact updated successfully!' : 'Contact added successfully!'
                });
                
                // Reset form and go back
                setFormData({
                    contactTitle: '',
                    mobile: '',
                    email: '',
                    address: '',
                    thanaDistrict: '',
                    postOffice: ''
                });
                
                if (onBack) {
                    onBack();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save contact'
                });
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save contact'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            contactTitle: '',
            mobile: '',
            email: '',
            address: '',
            thanaDistrict: '',
            postOffice: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {editingContact ? 'এডিট কন্টাক্ট' : 'নতুন কন্টাক্ট'}
                        </h1>
                        <p className="text-gray-600">
                            {editingContact ? 'যোগাযোগ তথ্য আপডেট করুন' : 'নতুন যোগাযোগ তথ্য যোগ করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* যোগাযোগ করুন */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    যোগাযোগ করুন *
                                </label>
                                <input
                                    type="text"
                                    name="contactTitle"
                                    value={formData.contactTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="যেমন: প্রধান শিক্ষক, অফিস, হোস্টেল ইত্যাদি"
                                    required
                                />
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* মোবাইল */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মোবাইল *
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>

                                {/* ইমেইল */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ইমেইল
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            {/* ঠিকানা */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ঠিকানা
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                                />
                            </div>

                            {/* Location Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* থানা/জেলা */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        থানা/জেলা
                                    </label>
                                    <input
                                        type="text"
                                        name="thanaDistrict"
                                        value={formData.thanaDistrict}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="থানা এবং জেলার নাম"
                                    />
                                </div>

                                {/* পোস্ট অফিস */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পোস্ট অফিস
                                    </label>
                                    <input
                                        type="text"
                                        name="postOffice"
                                        value={formData.postOffice}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="পোস্ট অফিসের নাম"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <FaSave />
                                    {loading 
                                        ? (editingContact ? 'Updating...' : 'Saving...') 
                                        : (editingContact ? 'Update Contact' : 'Save Contact')
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewContact;