import { Mail, Map, MapPin, Phone, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Loader from '../../../../../components/sharedItems/Loader/Loader';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';

const ContactInfoAdmin = () => {
    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        phone1: '',
        phone2: '',
        email: '',
        eiin: '',
        googleMapLink: ''
    });

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/contact-info');
            
            if (response.data.success) {
                setContactData(response.data.data);
                if (response.data.data) {
                    setFormData({
                        address: response.data.data.address || '',
                        phone1: response.data.data.phone1 || '',
                        phone2: response.data.data.phone2 || '',
                        email: response.data.data.email || '',
                        eiin: response.data.data.eiin || '',
                        googleMapLink: response.data.data.googleMapLink || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
            Swal.fire('Error!', 'যোগাযোগ তথ্য লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.address.trim() || !formData.phone1.trim() || !formData.email.trim() || !formData.eiin.trim()) {
            Swal.fire('Error!', 'ঠিকানা, ফোন নম্বর, ইমেইল এবং EIIN প্রয়োজন', 'error');
            return;
        }

        try {
            setSaving(true);
            const response = await axiosInstance.post('/contact-info', {
                address: formData.address,
                phone1: formData.phone1,
                phone2: formData.phone2,
                email: formData.email,
                eiin: formData.eiin,
                googleMapLink: formData.googleMapLink
            });

            if (response.data.success) {
                Swal.fire('Success!', 'যোগাযোগ তথ্য সফলভাবে সেভ হয়েছে', 'success');
                fetchContactData();
            }
        } catch (error) {
            console.error('Error saving contact data:', error);
            Swal.fire('Error!', 'যোগাযোগ তথ্য সেভ করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!formData.address.trim() || !formData.phone1.trim() || !formData.email.trim() || !formData.eiin.trim()) {
            Swal.fire('Error!', 'ঠিকানা, ফোন নম্বর, ইমেইল এবং EIIN প্রয়োজন', 'error');
            return;
        }

        try {
            setSaving(true);
            const response = await axiosInstance.put(`/contact-info/${contactData._id}`, {
                address: formData.address,
                phone1: formData.phone1,
                phone2: formData.phone2,
                email: formData.email,
                eiin: formData.eiin,
                googleMapLink: formData.googleMapLink
            });

            if (response.data.success) {
                Swal.fire('Success!', 'যোগাযোগ তথ্য সফলভাবে আপডেট হয়েছে', 'success');
                fetchContactData();
            }
        } catch (error) {
            console.error('Error updating contact data:', error);
            Swal.fire('Error!', 'যোগাযোগ তথ্য আপডেট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">যোগাযোগ তথ্য এডমিন</h1>
                    <p className="text-gray-600">বিদ্যালয়ের যোগাযোগের তথ্য আপডেট করুন</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Contact Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1e90c9]" />
                                ঠিকানা *
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="বিদ্যালয়ের সম্পূর্ণ ঠিকানা লিখুন"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent resize-none"
                                rows="3"
                            />
                        </div>

                        {/* Phone 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#1e90c9]" />
                                ফোন নম্বর ১ *
                            </label>
                            <input
                                type="text"
                                value={formData.phone1}
                                onChange={(e) => handleInputChange('phone1', e.target.value)}
                                placeholder="+8801309-103968"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            />
                        </div>

                        {/* Phone 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#1e90c9]" />
                                ফোন নম্বর ২
                            </label>
                            <input
                                type="text"
                                value={formData.phone2}
                                onChange={(e) => handleInputChange('phone2', e.target.value)}
                                placeholder="+8801715-631556"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#1e90c9]" />
                                ইমেইল *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="suchiparahighschool@gmail.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            />
                        </div>

                        {/* EIIN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                EIIN নম্বর *
                            </label>
                            <input
                                type="text"
                                value={formData.eiin}
                                onChange={(e) => handleInputChange('eiin', e.target.value)}
                                placeholder="103968"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            />
                        </div>

                        {/* Google Map Link */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Map className="w-4 h-4 text-[#1e90c9]" />
                                গুগল ম্যাপ লিঙ্ক
                            </label>
                            <input
                                type="url"
                                value={formData.googleMapLink}
                                onChange={(e) => handleInputChange('googleMapLink', e.target.value)}
                                placeholder="https://maps.google.com/?q=23.8103,90.4125"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                গুগল ম্যাপের embed URL বা শেয়ার লিঙ্ক দিন (ঐচ্ছিক)
                            </p>
                        </div>
                    </div>

                    {/* Save/Update Button */}
                    <div className="flex justify-end">
                        <MainButton
                            onClick={contactData ? handleUpdate : handleSave}
                            disabled={saving}
                            className="rounded-md"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    সেভ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    {contactData ? 'আপডেট করুন' : 'সেভ করুন'}
                                </>
                            )}
                        </MainButton>
                    </div>

                    {/* Preview Section */}
                    {contactData && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">বর্তমান তথ্য প্রিভিউ</h3>
                            
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-700 mb-4  pb-2 inline-block">
                                    যোগাযোগ
                                </h4>
                                <ul className="space-y-4 text-sm">
                                    <li className="flex items-start">
                                        <MapPin className="w-4 h-4 text-[#1e90c9] mr-3 mt-1 shrink-0" />
                                        <span>{contactData.address}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Phone className="w-4 h-4 text-[#1e90c9] mr-3 mt-1 shrink-0" />
                                        <span>
                                            {contactData.phone1}
                                            {contactData.phone2 && `, ${contactData.phone2}`}
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Mail className="w-4 h-4 text-[#1e90c9] mr-3 mt-1 shrink-0" />
                                        <span>{contactData.email}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Star className="w-4 h-4 text-[#1e90c9] mr-3 mt-1 shrink-0" />
                                        <span>EIIN- {contactData.eiin}</span>
                                    </li>
                                    {contactData.googleMapLink && (
                                        <li className="flex items-start">
                                            <Map className="w-4 h-4 text-[#1e90c9] mr-3 mt-1 shrink-0" />
                                            <div>
                                                <span className="block">গুগল ম্যাপ লিঙ্ক:</span>
                                                <a 
                                                    href={contactData.googleMapLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-xs break-all"
                                                >
                                                    {contactData.googleMapLink}
                                                </a>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactInfoAdmin;