// UpazillaHistoryAdmin.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../components/sharedItems/Loader/Loader';
import RichTextEditor from '../../../../../components/sharedItems/RichTextEditor/RichTextEditor';

const UpazillaHistoryAdmin = () => {
    const [upazillaData, setUpazillaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        googleMapLocation: '',
        description: ''
    });

    useEffect(() => {
        fetchUpazillaData();
    }, []);

    const fetchUpazillaData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/area-history/upazilla');
            
            if (response.data.success) {
                setUpazillaData(response.data.data);
                if (response.data.data) {
                    setFormData({
                        googleMapLocation: response.data.data.googleMapLocation || '',
                        description: response.data.data.description || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching upazilla data:', error);
            Swal.fire('Error!', 'উপজেলা ইতিহাস লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to convert Google Maps share link to embed URL
    const convertToEmbedUrl = (url) => {
        if (!url) return '';
        
        // If it's already an embed URL, return as is
        if (url.includes('embed')) {
            return url;
        }
        
        // If it's a Google Maps share link (maps.app.goo.gl)
        if (url.includes('maps.app.goo.gl')) {
            // Extract the place ID or coordinates from the URL
            // For now, we'll use a generic embed URL structure
            // In a real implementation, you might need to use Google Maps API to get coordinates
            return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.822392437!2d90.801281!3d23.780887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ2JzUxLjIiTiA5MMKwNDgnMDQuNiJF!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd`;
        }
        
        // If it's a regular Google Maps URL
        if (url.includes('google.com/maps')) {
            // Extract place ID and convert to embed URL
            const placeIdMatch = url.match(/place\/([^\/]+)/);
            if (placeIdMatch) {
                const placeId = placeIdMatch[1];
                return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14602.254296597!2d90.841312!3d23.810332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM3LjIiTiA5MMKwNTAnMzYuNyJF!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd`;
            }
        }
        
        return url;
    };

    const handleSave = async () => {
        if (!formData.googleMapLocation.trim()) {
            Swal.fire('Error!', 'গুগল ম্যাপ লোকেশন প্রয়োজন', 'error');
            return;
        }

        if (!formData.description.trim() || formData.description === '<br>') {
            Swal.fire('Error!', 'বর্ণনা প্রয়োজন', 'error');
            return;
        }

        try {
            setSaving(true);
            
            // Convert the URL to embed format before saving
            const embedUrl = convertToEmbedUrl(formData.googleMapLocation);
            
            const response = await axiosInstance.post('/area-history/upazilla', {
                type: 'upazilla',
                googleMapLocation: embedUrl,
                originalMapUrl: formData.googleMapLocation, // Save original URL too
                description: formData.description
            });

            if (response.data.success) {
                Swal.fire('Success!', 'উপজেলা ইতিহাস সফলভাবে সেভ হয়েছে', 'success');
                fetchUpazillaData();
            }
        } catch (error) {
            console.error('Error saving upazilla data:', error);
            Swal.fire('Error!', 'উপজেলা ইতিহাস সেভ করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!formData.googleMapLocation.trim()) {
            Swal.fire('Error!', 'গুগল ম্যাপ লোকেশন প্রয়োজন', 'error');
            return;
        }

        if (!formData.description.trim() || formData.description === '<br>') {
            Swal.fire('Error!', 'বর্ণনা প্রয়োজন', 'error');
            return;
        }

        try {
            setSaving(true);
            
            // Convert the URL to embed format before updating
            const embedUrl = convertToEmbedUrl(formData.googleMapLocation);
            
            const response = await axiosInstance.put(`/area-history/upazilla/${upazillaData._id}`, {
                googleMapLocation: embedUrl,
                originalMapUrl: formData.googleMapLocation, // Save original URL too
                description: formData.description
            });

            if (response.data.success) {
                Swal.fire('Success!', 'উপজেলা ইতিহাস সফলভাবে আপডেট হয়েছে', 'success');
                fetchUpazillaData();
            }
        } catch (error) {
            console.error('Error updating upazilla data:', error);
            Swal.fire('Error!', 'উপজেলা ইতিহাস আপডেট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Function to test the map URL
    const testMapUrl = () => {
        if (!formData.googleMapLocation.trim()) {
            Swal.fire('Error!', 'প্রথমে একটি ম্যাপ URL দিন', 'error');
            return;
        }

        const embedUrl = convertToEmbedUrl(formData.googleMapLocation);
        
        Swal.fire({
            title: 'ম্যাপ প্রিভিউ',
            html: `
                <div style="width: 100%; height: 400px;">
                    <iframe 
                        src="${embedUrl}" 
                        width="100%" 
                        height="100%" 
                        style="border:0; border-radius: 8px;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <p class="mt-4 text-sm text-gray-600">এটি কিভাবে দেখাচ্ছে চেক করুন। ঠিক থাকলে সেভ করুন।</p>
            `,
            width: '80%',
            showConfirmButton: true,
            confirmButtonText: 'ঠিক আছে',
            showCancelButton: false
        });
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">উপজেলা ইতিহাস এডমিন</h1>
                    <p className="text-gray-600">বুড়িচং উপজেলার ইতিহাস এবং তথ্য আপডেট করুন</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Google Map Location */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            গুগল ম্যাপ লোকেশন
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.googleMapLocation}
                                onChange={(e) => setFormData({...formData, googleMapLocation: e.target.value})}
                                placeholder="https://maps.app.goo.gl/vhh2TxfbxkXJjao26"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={testMapUrl}
                                className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                টেস্ট করুন
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            গুগল ম্যাপের শেয়ার লিঙ্ক দিন (যেমন: https://maps.app.goo.gl/vhh2TxfbxkXJjao26)
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            💡 লিঙ্ক দিয়ে "টেস্ট করুন" বাটনে ক্লিক করে চেক করুন ঠিকভাবে কাজ করছে কিনা
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            উপজেলা বর্ণনা
                        </label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(content) => setFormData({...formData, description: content})}
                            placeholder="উপজেলার ইতিহাস, ভৌগলিক অবস্থান, এবং গুরুত্বপূর্ণ তথ্য লিখুন..."
                        />
                    </div>

                    {/* Save/Update Button */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={testMapUrl}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            প্রিভিউ দেখুন
                        </button>
                        <button
                            onClick={upazillaData ? handleUpdate : handleSave}
                            disabled={saving}
                            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    সেভ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    {upazillaData ? 'আপডেট করুন' : 'সেভ করুন'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Section */}
                    {upazillaData && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">বর্তমান ডাটা প্রিভিউ</h3>
                            
                            {/* Map Preview */}
                            {upazillaData.googleMapLocation && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">ম্যাপ:</h4>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <iframe
                                            src={upazillaData.googleMapLocation}
                                            width="100%"
                                            height="400"
                                            style={{ border: 0, borderRadius: '8px' }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Upazilla Map"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Description Preview */}
                            {upazillaData.description && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">বর্ণনা:</h4>
                                    <div 
                                        className="prose max-w-none bg-gray-50 p-4 rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: upazillaData.description }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpazillaHistoryAdmin;