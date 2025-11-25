import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaImage, FaPaperPlane, FaPrint, FaSave, FaSms, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const AdmissionToken = ({ onBack }) => {
    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        monthlyFee: '',
        sendAttendanceSms: false,
        tokenTemplateId: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [createdToken, setCreatedToken] = useState(null);
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [tokenTemplates, setTokenTemplates] = useState([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch batches
            const batchesResponse = await axiosInstance.get('/batches');
            if (batchesResponse.data.success) {
                setBatches(batchesResponse.data.data || []);
            }

            // Fetch sections
            const sectionsResponse = await axiosInstance.get('/sections');
            if (sectionsResponse.data.success) {
                setSections(sectionsResponse.data.data || []);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
            }

            // Fetch token templates
            const tokensResponse = await axiosInstance.get('/admission-token');
            if (tokensResponse.data.success) {
                setTokenTemplates(tokensResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.classId || !formData.sessionId) {
            showSweetAlert('warning', 'অনুগ্রহ করে ক্লাস এবং সেশন নির্বাচন করুন');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.post('/admission-token', formData);

            if (response.data.success) {
                showSweetAlert('success', 'এডমিশন টোকেন সফলভাবে তৈরি হয়েছে');
                
                // Save the created token data for printing
                const selectedClass = classes.find(c => c._id === formData.classId);
                const selectedSession = sessions.find(s => s._id === formData.sessionId);
                const selectedBatch = batches.find(b => b._id === formData.batchId);
                const selectedSection = sections.find(s => s._id === formData.sectionId);
                
                setCreatedToken({
                    ...formData,
                    className: selectedClass?.name || '',
                    sessionName: selectedSession?.name || '',
                    batchName: selectedBatch?.name || '',
                    sectionName: selectedSection?.name || '',
                    tokenId: response.data.data?._id || Date.now().toString(),
                    createdAt: new Date().toLocaleDateString('bn-BD')
                });

                // Reset form after successful submission
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    monthlyFee: '',
                    sendAttendanceSms: false,
                    tokenTemplateId: ''
                });
            }
        } catch (error) {
            console.error('Error creating admission token:', error);
            showSweetAlert('error', 'এডমিশন টোকেন তৈরি করতে সমস্যা হয়েছে');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const handlePrintToken = () => {
        const printContent = document.getElementById('admission-token-print');
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admission Token - ${createdToken.tokenId}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Hind Siliguri', 'SolaimanLipi', sans-serif;
                        background: #fff;
                        color: #333;
                        line-height: 1.6;
                        padding: 20px;
                    }
                    
                    .token-container {
                        max-width: 600px;
                        margin: 0 auto;
                        border: 3px solid #1e90c9;
                        border-radius: 15px;
                        padding: 30px;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        position: relative;
                    }
                    
                    .token-header {
                        text-align: center;
                        margin-bottom: 25px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #1e90c9;
                    }
                    
                    .token-header h1 {
                        color: #1e90c9;
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    
                    .token-header p {
                        color: #666;
                        font-size: 16px;
                    }
                    
                    .token-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 25px;
                    }
                    
                    .info-item {
                        background: white;
                        padding: 15px;
                        border-radius: 10px;
                        border: 1px solid #e2e8f0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .info-label {
                        font-size: 12px;
                        color: #64748b;
                        font-weight: 600;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    .info-value {
                        font-size: 16px;
                        color: #1e293b;
                        font-weight: 700;
                    }
                    
                    .fee-section {
                        background: #1e90c9;
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        margin-bottom: 25px;
                    }
                    
                    .fee-label {
                        font-size: 14px;
                        margin-bottom: 5px;
                        opacity: 0.9;
                    }
                    
                    .fee-amount {
                        font-size: 32px;
                        font-weight: 700;
                    }
                    
                    .token-footer {
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                    }
                    
                    .token-id {
                        background: #1e90c9;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        font-weight: 600;
                        display: inline-block;
                        margin-bottom: 15px;
                    }
                    
                    .print-date {
                        font-size: 12px;
                        color: #64748b;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        .token-container {
                            border: none;
                            box-shadow: none;
                            margin: 0;
                            max-width: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="token-container">
                    <div class="token-header">
                        <h1>🎓 এডমিশন টোকেন</h1>
                        <p>Admission Token</p>
                    </div>
                    
                    <div class="token-info">
                        <div class="info-item">
                            <div class="info-label">ক্লাস</div>
                            <div class="info-value">${createdToken.className}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">সেশন</div>
                            <div class="info-value">${createdToken.sessionName}</div>
                        </div>
                        ${createdToken.batchName ? `
                        <div class="info-item">
                            <div class="info-label">ব্যাচ</div>
                            <div class="info-value">${createdToken.batchName}</div>
                        </div>
                        ` : ''}
                        ${createdToken.sectionName ? `
                        <div class="info-item">
                            <div class="info-label">সেকশন</div>
                            <div class="info-value">${createdToken.sectionName}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${createdToken.monthlyFee ? `
                    <div class="fee-section">
                        <div class="fee-label">মাসিক ফি</div>
                        <div class="fee-amount">৳ ${formatCurrency(createdToken.monthlyFee)}</div>
                        <div class="fee-label">Monthly Fee</div>
                    </div>
                    ` : ''}
                    
                    ${createdToken.sendAttendanceSms ? `
                    <div class="info-item" style="grid-column: 1 / -1; text-align: center;">
                        <div class="info-label">এসএমএস সার্ভিস</div>
                        <div class="info-value" style="color: #059669;">সক্রিয় ✓</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 5px;">উপস্থিতি এসএমএস পাঠানো হবে</div>
                    </div>
                    ` : ''}
                    
                    <div class="token-footer">
                        <div class="token-id">টোকেন আইডি: ${createdToken.tokenId}</div>
                        <div class="print-date">প্রিন্টের তারিখ: ${createdToken.createdAt}</div>
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    };

    const handleCreateNewToken = () => {
        setCreatedToken(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            এডমিশন টোকেন
                        </h1>
                    </div>
                    {createdToken && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateNewToken}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                নতুন টোকেন তৈরি করুন
                            </button>
                            <MainButton
                                onClick={handlePrintToken}
                                className="flex items-center gap-2"
                            >
                                <FaPrint className="text-sm" />
                                প্রিন্ট টোকেন
                            </MainButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Success Message and Print Option */}
                    {createdToken && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                                        ✅ এডমিশন টোকেন সফলভাবে তৈরি হয়েছে!
                                    </h3>
                                    <p className="text-green-700">
                                        টোকেন আইডি: <strong>{createdToken.tokenId}</strong> | 
                                        ক্লাস: <strong>{createdToken.className}</strong> | 
                                        সেশন: <strong>{createdToken.sessionName}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Section */}
                    {!createdToken && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                                এডমিশন টোকেন তৈরি করুন
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Academic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                        একাডেমিক তথ্য
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Class */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ক্লাস *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="classId"
                                                    value={formData.classId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                    disabled={saving}
                                                    required
                                                >
                                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                                    {classes.map((classItem) => (
                                                        <option key={classItem._id} value={classItem._id}>
                                                            {classItem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Batch */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ব্যাচ
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="batchId"
                                                    value={formData.batchId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                    disabled={saving}
                                                >
                                                    <option value="">ব্যাচ নির্বাচন করুন</option>
                                                    {batches.map((batch) => (
                                                        <option key={batch._id} value={batch._id}>
                                                            {batch.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                সেকশন
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="sectionId"
                                                    value={formData.sectionId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                    disabled={saving}
                                                >
                                                    <option value="">সেকশন নির্বাচন করুন</option>
                                                    {sections.map((section) => (
                                                        <option key={section._id} value={section._id}>
                                                            {section.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Active Session */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Active Session *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="sessionId"
                                                    value={formData.sessionId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                    disabled={saving}
                                                    required
                                                >
                                                    <option value="">সেশন নির্বাচন করুন</option>
                                                    {sessions.map((session) => (
                                                        <option key={session._id} value={session._id}>
                                                            {session.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fee Information */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                        ফি তথ্য
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Fee From Madrasha / College
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="monthlyFee"
                                                value={formData.monthlyFee}
                                                onChange={handleChange}
                                                placeholder="মাসিক ফি লিখুন"
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                                min="0"
                                                step="0.01"
                                            />
                                            <FaPaperPlane className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                        {formData.monthlyFee && (
                                            <p className="text-sm text-green-600 mt-1">
                                                মাসিক ফি: ৳{formatCurrency(formData.monthlyFee)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* SMS Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                        এসএমএস সেটিংস
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <input
                                            type="checkbox"
                                            name="sendAttendanceSms"
                                            checked={formData.sendAttendanceSms}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#1e90c9]"
                                            disabled={saving}
                                            id="sendAttendanceSms"
                                        />
                                        <label htmlFor="sendAttendanceSms" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                            <FaSms className="text-green-500" />
                                            Send attendance sms
                                        </label>
                                    </div>
                                </div>

                                {/* Token Template */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                        টোকেন টেমপ্লেট
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Token Template
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="tokenTemplateId"
                                                value={formData.tokenTemplateId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                            >
                                                <option value="">টোকেন টেমপ্লেট নির্বাচন করুন</option>
                                                {tokenTemplates.map((template) => (
                                                    <option key={template._id} value={template._id}>
                                                        {template.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaImage className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Token Template Preview */}
                                    {formData.tokenTemplateId && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                টেমপ্লেট প্রিভিউ
                                            </h4>
                                            <div className="flex justify-center">
                                                <div className="w-48 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <FaImage className="text-3xl text-gray-400" />
                                                    <span className="text-xs text-gray-500 ml-2">টেমপ্লেট ইমেজ</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <MainButton
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                সংরক্ষণ হচ্ছে...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="text-sm mr-2" />
                                                সংরক্ষণ করুন
                                            </>
                                        )}
                                    </MainButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Information Card */}
                    <div className="bg-blue-50 rounded-2xl p-6 mt-6">
                        <h3 className="text-md font-semibold text-[#1e90c9] mb-2">
                            এডমিশন টোকেন সম্পর্কে
                        </h3>
                        <ul className="text-sm text-[#1e90c9] space-y-1">
                            <li>• এডমিশন টোকেন নতুন শিক্ষার্থীদের জন্য তৈরি করুন</li>
                            <li>• ক্লাস এবং সেশন বাধ্যতামূলক</li>
                            <li>• টোকেন টেমপ্লেট নির্বাচন করা ঐচ্ছিক</li>
                            <li>• এসএমএস পাঠানো হলে শিক্ষার্থীদের নোটিফিকেশন যাবে</li>
                            <li>• টোকেন তৈরি হওয়ার পর সাথে সাথে প্রিন্ট করে নিন</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div id="admission-token-print" style={{ display: 'none' }}></div>
        </div>
    );
};

export default AdmissionToken;