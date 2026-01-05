import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const InstituteInfo = () => {
    const [formData, setFormData] = useState({
        name: '',
        founder: '',
        established: '',
        eiin: '',
        slogan: '',
        shortDescription: '',
        mobile: '',
        introduction: '',
        address: '',
        thanaDistrict: '',
        postOffice: '',
        country: 'Bangladesh',
        language: 'bengali',
        email: ''
    });
    
    const [files, setFiles] = useState({
        logo: null,
        favicon: null,
        principalSignature: null,
        educationSecretarySignature: null
    });
    
    const [filePreviews, setFilePreviews] = useState({
        logo: '',
        favicon: '',
        principalSignature: '',
        educationSecretarySignature: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [existingData, setExistingData] = useState(null);

    // Fetch existing institute info
    useEffect(() => {
        fetchInstituteInfo();
    }, []);

    const fetchInstituteInfo = async () => {
        try {
            const response = await axiosInstance.get('/institute-info');
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setExistingData(data);
                setFormData({
                    name: data.name || '',
                    founder: data.founder || '',
                    established: data.established || '',
                    eiin: data.eiin || '',
                    slogan: data.slogan || '',
                    shortDescription: data.shortDescription || '',
                    mobile: data.mobile || '',
                    introduction: data.introduction || '',
                    address: data.address || '',
                    thanaDistrict: data.thanaDistrict || '',
                    postOffice: data.postOffice || '',
                    country: data.country || 'Bangladesh',
                    language: data.language || 'bengali',
                    email: data.email || ''
                });

                // Set file previews if they exist
                if (data.logo) setFilePreviews(prev => ({...prev, logo: data.logo}));
                if (data.favicon) setFilePreviews(prev => ({...prev, favicon: data.favicon}));
                if (data.principalSignature) setFilePreviews(prev => ({...prev, principalSignature: data.principalSignature}));
                if (data.educationSecretarySignature) setFilePreviews(prev => ({...prev, educationSecretarySignature: data.educationSecretarySignature}));
            }
        } catch (error) {
            console.error('Error fetching institute info:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type and size
            const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!allowedImageTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File',
                    text: 'Please select a valid image file (JPEG, PNG, GIF)'
                });
                return;
            }

            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: 'Image size should be less than 2MB'
                });
                return;
            }

            setFiles(prev => ({
                ...prev,
                [fileType]: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreviews(prev => ({
                    ...prev,
                    [fileType]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIntroductionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            introduction: content
        }));
    };

    const uploadFile = async (file, fileType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

        try {
            const response = await axiosInstance.post('/institute-info/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({
                        ...prev,
                        [fileType]: percentCompleted
                    }));
                }
            });

            if (response.data.success) {
                return response.data.fileUrl;
            }
            throw new Error('Upload failed');
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.founder || !formData.established || !formData.mobile) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields (Name, Founder, Established, Mobile)'
            });
            return;
        }

        try {
            setLoading(true);

            // Upload files first
            const uploadedFiles = {};
            for (const [fileType, file] of Object.entries(files)) {
                if (file) {
                    const fileUrl = await uploadFile(file, fileType);
                    uploadedFiles[fileType] = fileUrl;
                }
            }

            // Prepare data for submission
            const submitData = {
                ...formData,
                ...uploadedFiles
            };

            let response;
            if (existingData) {
                // Update existing
                response = await axiosInstance.put(`/institute-info/${existingData._id}`, submitData);
            } else {
                // Create new
                response = await axiosInstance.post('/institute-info', submitData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Institute information saved successfully!'
                });
                fetchInstituteInfo(); // Refresh data
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save institute information'
                });
            }
        } catch (error) {
            console.error('Error saving institute info:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save institute information'
            });
        } finally {
            setLoading(false);
            setUploadProgress({});
        }
    };

    const countries = ['Bangladesh', 'India', 'Pakistan', 'Nepal', 'Sri Lanka', 'Other'];
    const languages = [
        { value: 'bengali', label: 'Bengali' },
        { value: 'english', label: 'English' },
        { value: 'bilingual', label: 'Bilingual (Bengali & English)' }
    ];

    return (
        <div className="max-w-full mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Institute Information</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    নাম (Name) *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Enter institute name"
                                    required
                                />
                            </div>

                            {/* Founder */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    প্রতিষ্ঠাতা (Founder) *
                                </label>
                                <input
                                    type="text"
                                    name="founder"
                                    value={formData.founder}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Enter founder name"
                                    required
                                />
                            </div>

                            {/* Established and EIIN */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        প্রতিষ্ঠাকাল (Established) *
                                    </label>
                                    <input
                                        type="number"
                                        name="established"
                                        value={formData.established}
                                        onChange={handleInputChange}
                                        min="1800"
                                        max="2030"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Year"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        EIIN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="eiin"
                                        value={formData.eiin}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Enter EIIN number"
                                    />
                                </div>
                            </div>

                            {/* Slogan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    স্লোগান (Slogan)
                                </label>
                                <input
                                    type="text"
                                    name="slogan"
                                    value={formData.slogan}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Enter institute slogan"
                                />
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description
                                </label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Brief description about the institute"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মোবাইল (Mobile) *
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="institute@email.com"
                                    />
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ঠিকানা (Address)
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    placeholder="Full address"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        থানা/জেলা (Thana/District)
                                    </label>
                                    <input
                                        type="text"
                                        name="thanaDistrict"
                                        value={formData.thanaDistrict}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Thana and District"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পোস্ট অফিস (Post Office)
                                    </label>
                                    <input
                                        type="text"
                                        name="postOffice"
                                        value={formData.postOffice}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        placeholder="Post office name"
                                    />
                                </div>
                            </div>

                            {/* Country and Language */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        দেশ (Country)
                                    </label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    >
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ভাষা (Language)
                                    </label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Introduction - Rich Text Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            পরিচিতি (Introduction)
                        </label>
                        <RichTextEditor
                            value={formData.introduction}
                            onChange={handleIntroductionChange}
                            placeholder="Write detailed introduction about your institute..."
                        />
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'logo')}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label htmlFor="logo-upload" className="cursor-pointer">
                                    {filePreviews.logo ? (
                                        <div className="space-y-2">
                                            <img 
                                                src={filePreviews.logo} 
                                                alt="Logo preview" 
                                                className="w-32 h-32 mx-auto object-contain border rounded"
                                            />
                                            <p className="text-sm text-gray-600">Click to change logo</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-gray-400">Logo</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Click to upload logo</p>
                                        </div>
                                    )}
                                </label>
                                {uploadProgress.logo > 0 && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-[#1e90c9] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress.logo}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{uploadProgress.logo}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Favicon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Browser Icon (Favicon)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'favicon')}
                                    className="hidden"
                                    id="favicon-upload"
                                />
                                <label htmlFor="favicon-upload" className="cursor-pointer">
                                    {filePreviews.favicon ? (
                                        <div className="space-y-2">
                                            <img 
                                                src={filePreviews.favicon} 
                                                alt="Favicon preview" 
                                                className="w-16 h-16 mx-auto object-contain border rounded"
                                            />
                                            <p className="text-sm text-gray-600">Click to change favicon</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">Favicon</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Click to upload favicon</p>
                                        </div>
                                    )}
                                </label>
                                {uploadProgress.favicon > 0 && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-[#1e90c9] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress.favicon}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{uploadProgress.favicon}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Principal Signature */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Principal Signature
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'principalSignature')}
                                    className="hidden"
                                    id="principal-signature-upload"
                                />
                                <label htmlFor="principal-signature-upload" className="cursor-pointer">
                                    {filePreviews.principalSignature ? (
                                        <div className="space-y-2">
                                            <img 
                                                src={filePreviews.principalSignature} 
                                                alt="Principal signature preview" 
                                                className="w-32 h-16 mx-auto object-contain border rounded"
                                            />
                                            <p className="text-sm text-gray-600">Click to change signature</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-32 h-16 mx-auto bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">Signature</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Click to upload signature</p>
                                        </div>
                                    )}
                                </label>
                                {uploadProgress.principalSignature > 0 && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-[#1e90c9] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress.principalSignature}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{uploadProgress.principalSignature}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Education Secretary Signature */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Education Secretary Signature
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'educationSecretarySignature')}
                                    className="hidden"
                                    id="secretary-signature-upload"
                                />
                                <label htmlFor="secretary-signature-upload" className="cursor-pointer">
                                    {filePreviews.educationSecretarySignature ? (
                                        <div className="space-y-2">
                                            <img 
                                                src={filePreviews.educationSecretarySignature} 
                                                alt="Secretary signature preview" 
                                                className="w-32 h-16 mx-auto object-contain border rounded"
                                            />
                                            <p className="text-sm text-gray-600">Click to change signature</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-32 h-16 mx-auto bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">Signature</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Click to upload signature</p>
                                        </div>
                                    )}
                                </label>
                                {uploadProgress.educationSecretarySignature > 0 && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-[#1e90c9] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress.educationSecretarySignature}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{uploadProgress.educationSecretarySignature}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <MainButton
                            type="submit"
                            disabled={loading}
                            className='rounded-md'
                        >
                            {loading ? 'Saving...' : (existingData ? 'Update Institute Info' : 'Save Institute Info')}
                        </MainButton>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className=" px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstituteInfo;