import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDownload, FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AnnualReports = ({ onBack }) => {
    const [annualReports, setAnnualReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear().toString(),
        reportFile: null
    });
    const [formLoading, setFormLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [filePreview, setFilePreview] = useState(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        fetchAnnualReports();
    }, []);

    useEffect(() => {
        if (editingReport) {
            setFormData({
                title: editingReport.title || '',
                description: editingReport.description || '',
                year: editingReport.year || currentYear.toString(),
                reportFile: null
            });
            if (editingReport.reportFile) {
                setFilePreview(editingReport.reportFile);
            }
        }
    }, [editingReport]);

    const fetchAnnualReports = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/annual-reports');
            
            if (response.data.success) {
                setAnnualReports(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching annual reports:', error);
            showSweetAlert('error', 'বার্ষিক রিপোর্ট লোড করতে সমস্যা হয়েছে');
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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
        
        if (errors.description) {
            setErrors(prev => ({
                ...prev,
                description: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is PDF
            if (file.type !== 'application/pdf') {
                showSweetAlert('error', 'শুধুমাত্র PDF ফাইল আপলোড করুন');
                return;
            }

            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showSweetAlert('error', 'ফাইলের সাইজ ১০MB এর কম হতে হবে');
                return;
            }

            setFormData(prev => ({
                ...prev,
                reportFile: file
            }));

            setFilePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'শিরোনাম প্রয়োজন';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'বিবরণ প্রয়োজন';
        }

        if (!formData.year) {
            newErrors.year = 'বছর নির্বাচন করুন';
        }

        if (!editingReport && !formData.reportFile) {
            newErrors.reportFile = 'রিপোর্ট ফাইল (PDF) প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setFormLoading(true);
        try {
            const submitData = new FormData();
            
            submitData.append('title', formData.title.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('year', formData.year);
            
            if (formData.reportFile) {
                submitData.append('reportFile', formData.reportFile);
            }

            let response;
            
            if (editingReport) {
                response = await axiosInstance.put(`/annual-reports/${editingReport._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/annual-reports', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                handleBackToList();
                fetchAnnualReports();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving annual report:', error);
            const errorMessage = error.response?.data?.message || 'বার্ষিক রিপোর্ট সংরক্ষণ করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (report) => {
        setEditingReport(report);
        setShowForm(true);
    };

    const handleDelete = async (reportId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই বার্ষিক রিপোর্টটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/annual-reports/${reportId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'বার্ষিক রিপোর্ট সফলভাবে ডিলিট হয়েছে');
                    fetchAnnualReports();
                }
            } catch (error) {
                console.error('Error deleting annual report:', error);
                showSweetAlert('error', 'বার্ষিক রিপোর্ট ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (reportId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/annual-reports/${reportId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchAnnualReports();
            }
        } catch (error) {
            console.error('Error toggling annual report status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingReport(null);
        setFormData({
            title: '',
            description: '',
            year: new Date().getFullYear().toString(),
            reportFile: null
        });
        setFilePreview(null);
        setShowForm(true);
    };

    const handleBackToList = () => {
        setShowForm(false);
        setEditingReport(null);
        setFormData({
            title: '',
            description: '',
            year: new Date().getFullYear().toString(),
            reportFile: null
        });
        setFilePreview(null);
        setErrors({});
    };

    const downloadReport = (reportFile) => {
        if (reportFile) {
            window.open(`${baseImageURL}${reportFile}`, '_blank');
        }
    };

    const viewReport = (reportFile) => {
        if (reportFile) {
            window.open(`${baseImageURL}${reportFile}`, '_blank');
        }
    };

    // If showForm is true, show the form
    if (showForm) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackToList}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="text-xl text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {editingReport ? 'বার্ষিক রিপোর্ট এডিট করুন' : 'নতুন বার্ষিক রিপোর্ট যোগ করুন'}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-full mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* শিরোনাম */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শিরোনাম *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="বার্ষিক রিপোর্টের শিরোনাম লিখুন"
                                        disabled={formLoading}
                                    />
                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* বছর */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বছর *
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleFormChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.year ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={formLoading}
                                    >
                                        <option value="">বছর নির্বাচন করুন</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.year && (
                                        <p className="mt-2 text-sm text-red-600">{errors.year}</p>
                                    )}
                                </div>

                                {/* বিবরণ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বিবরণ *
                                    </label>
                                    <RichTextEditor
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                        placeholder="বার্ষিক রিপোর্টের বিস্তারিত বিবরণ লিখুন..."
                                        height="200px"
                                    />
                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Report File - PDF */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Report File - PDF {!editingReport && '*'}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="report-file-upload"
                                            accept=".pdf,application/pdf"
                                        />
                                        <label
                                            htmlFor="report-file-upload"
                                            className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1e90c9] text-white rounded-lg  transition-colors font-medium"
                                        >
                                            <FaPlus className="text-sm" />
                                            {formData.reportFile ? 'ফাইল পরিবর্তন করুন' : 'PDF ফাইল আপলোড করুন'}
                                        </label>
                                        
                                        {formData.reportFile && (
                                            <div className="mt-4">
                                                <p className="text-sm text-green-600 font-medium">
                                                    {formData.reportFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(formData.reportFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        )}

                                        {filePreview && !formData.reportFile && (
                                            <div className="mt-4">
                                                <p className="text-sm text-blue-600 font-medium">
                                                    পূর্ববর্তী ফাইল: {editingReport?.fileName}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => viewReport(filePreview)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <FaEye className="text-sm" />
                                                    পূর্ববর্তী ফাইল দেখুন
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        শুধুমাত্র PDF ফাইল (সর্বোচ্চ ১০MB)
                                    </p>
                                    {errors.reportFile && (
                                        <p className="mt-2 text-sm text-red-600">{errors.reportFile}</p>
                                    )}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleBackToList}
                                        disabled={formLoading}
                                        className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        বাতিল করুন
                                    </button>
                                    <MainButton
                                        type="submit"
                                        disabled={formLoading}
                                        className="rounded-md"
                                    >
                                        {formLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                {editingReport ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="text-sm mr-2" />
                                                {editingReport ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                            </>
                                        )}
                                    </MainButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main list view
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
                            বার্ষিক রিপোর্ট ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন রিপোর্ট
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">বার্ষিক রিপোর্ট লোড হচ্ছে...</p>
                        </div>
                    ) : annualReports.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন বার্ষিক রিপোর্ট পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন বার্ষিক রিপোর্ট তৈরি করুন
                            </p>
                            <MainButton
                                onClick={handleAddNew}
                            >
                                <FaPlus className="text-sm mr-2" />
                                নতুন বার্ষিক রিপোর্ট তৈরি করুন
                            </MainButton>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {annualReports.map((report) => (
                                <div key={report._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                    {report.title}
                                                </h3>
                                                <p className="text-sm text-[#1e90c9] font-semibold">
                                                    বছর: {report.year}
                                                </p>
                                            </div>
                                            <span
                                                onClick={() => handleToggleStatus(report._id, report.isActive)}
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                    report.isActive 
                                                        ? 'bg-[#1e90c9] text-white hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {report.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </div>

                                        <div 
                                            className="text-sm text-gray-600 mb-4 line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: report.description }}
                                        />

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                            <span>ফাইল: {report.fileName}</span>
                                            <span>{(report.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => viewReport(report.reportFile)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="দেখুন"
                                                >
                                                    <FaEye className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => downloadReport(report.reportFile)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="ডাউনলোড"
                                                >
                                                    <FaDownload className="text-sm" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(report)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="এডিট"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(report._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ডিলিট"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnualReports;