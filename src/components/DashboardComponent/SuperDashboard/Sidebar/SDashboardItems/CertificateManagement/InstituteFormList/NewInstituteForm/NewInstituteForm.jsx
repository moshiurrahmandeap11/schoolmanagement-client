import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const NewInstituteForm = ({ editingInstitute, onBack }) => {
    const [form, setForm] = useState({
        category: '',
        class: '',
        batch: '',
        section: '',
        session: '',
        previewImage: null,
        headerImage: null,
        backgroundImage: null,
        details: '',
        status: 'Active',
        language: 'Bengali'
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);

    const languages = [
        { value: 'Bengali', label: 'বাংলা' },
        { value: 'English', label: 'English' },
        { value: 'Arabic', label: 'العربية' },
        { value: 'Hindi', label: 'हिंदी' },
        { value: 'Urdu', label: 'اردو' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'সক্রিয়' },
        { value: 'Inactive', label: 'নিষ্ক্রিয়' }
    ];

    // Fetch categories, classes, batches, sections
    useEffect(() => {
        fetchCategories();
        fetchClasses();
    }, []);

    // Fetch batches when class is selected
    useEffect(() => {
        if (form.class) {
            fetchBatches(form.class);
        } else {
            setBatches([]);
            setSections([]);
        }
    }, [form.class]);

    // Fetch sections when batch is selected
    useEffect(() => {
        if (form.class && form.batch) {
            fetchSections(form.class, form.batch);
        } else {
            setSections([]);
        }
    }, [form.class, form.batch]);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get('/certificate/certificate-category');
            setCategories(res.data.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            Swal.fire('ত্রুটি!', 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axiosInstance.get('/classes');
            setClasses(res.data.data || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
            Swal.fire('ত্রুটি!', 'ক্লাস লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    const fetchBatches = async (className) => {
        try {
            const res = await axiosInstance.get(`/classes/batch?className=${encodeURIComponent(className)}`); 
            setBatches(res.data.data || []);
        } catch (err) {
            console.error('Error fetching batches:', err);
            Swal.fire('ত্রুটি!', 'ব্যাচ লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    const fetchSections = async (className, batchName) => {
        try {
            const res = await axiosInstance.get(`/classes/section?className=${encodeURIComponent(className)}&batch=${encodeURIComponent(batchName)}`); // ✅ সংশোধন: /api/classes/section
            setSections(res.data.data || []);
        } catch (err) {
            console.error('Error fetching sections:', err);
            Swal.fire('ত্রুটি!', 'সেকশন লোড করতে সমস্যা হয়েছে', 'error');
        }
    };

    useEffect(() => {
        if (editingInstitute) {
            setForm({
                category: editingInstitute.category || '',
                class: editingInstitute.class || '',
                batch: editingInstitute.batch || '',
                section: editingInstitute.section || '',
                session: editingInstitute.session || '',
                previewImage: editingInstitute.previewImage || null,
                headerImage: editingInstitute.headerImage || null,
                backgroundImage: editingInstitute.backgroundImage || null,
                details: editingInstitute.details || '',
                status: editingInstitute.status || 'Active',
                language: editingInstitute.language || 'Bengali'
            });

            // If editing, fetch batches and sections based on existing data
            if (editingInstitute.class) {
                fetchBatches(editingInstitute.class);
            }
            if (editingInstitute.class && editingInstitute.batch) {
                fetchSections(editingInstitute.class, editingInstitute.batch);
            }
        }
    }, [editingInstitute]);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({
                ...prev,
                [field]: file
            }));
        }
    };

    const handleRichTextChange = (content) => {
        setForm(prev => ({
            ...prev,
            details: content
        }));
    };

    const handleCategoryChange = (e) => {
        setForm(prev => ({
            ...prev,
            category: e.target.value
        }));
    };

    const handleClassChange = (e) => {
        const selectedClass = e.target.value;
        setForm(prev => ({
            ...prev,
            class: selectedClass,
            batch: '', // Reset batch when class changes
            section: '' // Reset section when class changes
        }));
    };

    const handleBatchChange = (e) => {
        const selectedBatch = e.target.value;
        setForm(prev => ({
            ...prev,
            batch: selectedBatch,
            section: '' // Reset section when batch changes
        }));
    };

    const handleSectionChange = (e) => {
        setForm(prev => ({
            ...prev,
            section: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!form.category || !form.class || !form.batch) {
            Swal.fire('ভুল!', 'অনুগ্রহ করে প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন', 'warning');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('category', form.category);
            formData.append('class', form.class);
            formData.append('batch', form.batch);
            formData.append('section', form.section);
            formData.append('session', form.session);
            formData.append('details', form.details);
            formData.append('status', form.status);
            formData.append('language', form.language);

            // শুধুমাত্র File object হলে append করুন
            if (form.previewImage instanceof File) {
                formData.append('previewImage', form.previewImage);
            }
            if (form.headerImage instanceof File) {
                formData.append('headerImage', form.headerImage);
            }
            if (form.backgroundImage instanceof File) {
                formData.append('backgroundImage', form.backgroundImage);
            }

            console.log('Submitting form data...');

            if (editingInstitute) {
                await axiosInstance.put(`/certificate/institute-forms/${editingInstitute._id}`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data' 
                    }
                });
                Swal.fire('সফল!', 'ইনস্টিটিউট আপডেট করা হয়েছে', 'success');
            } else {
                await axiosInstance.post('/certificate/institute-forms', formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data' 
                    }
                });
                Swal.fire('সফল!', 'নতুন ইনস্টিটিউট তৈরি হয়েছে', 'success');
            }
            onBack();
        } catch (err) {
            console.error('Error:', err);
            console.error('Error response:', err.response);
            Swal.fire(
                'ত্রুটি!', 
                err.response?.data?.message || err.response?.data?.error || 'সমস্যা হয়েছে', 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={onBack}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            <FaArrowLeft />
                        </button>
                        <h2 className="text-xl font-bold text-blue-800">
                            {editingInstitute ? 'ইনস্টিটিউট এডিট করুন' : 'নতুন ইনস্টিটিউট ফর্ম তৈরি করুন'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ক্যাটাগরী ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ক্যাটাগরী <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={form.category}
                                    onChange={handleCategoryChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">ক্যাটাগরী নির্বাচন করুন</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ক্লাস ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ক্লাস <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={form.class}
                                    onChange={handleClassChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls.name}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ব্যাচ ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ব্যাচ <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={form.batch}
                                    onChange={handleBatchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    required
                                    disabled={loading || !form.class}
                                >
                                    <option value="">ব্যাচ নির্বাচন করুন</option>
                                    {batches.map(batch => (
                                        <option key={batch._id} value={batch.name}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>
                                {!form.class && (
                                    <p className="text-xs text-red-500 mt-1">প্রথমে ক্লাস নির্বাচন করুন</p>
                                )}
                            </div>

                            {/* সেকশন ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    সেকশন
                                </label>
                                <select
                                    value={form.section}
                                    onChange={handleSectionChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    disabled={loading || !form.batch}
                                >
                                    <option value="">সেকশন নির্বাচন করুন</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section.name}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                                {!form.batch && (
                                    <p className="text-xs text-red-500 mt-1">প্রথমে ব্যাচ নির্বাচন করুন</p>
                                )}
                            </div>

                            {/* সেশন (ম্যানুয়াল ইনপুট) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    সেশন
                                </label>
                                <input
                                    type="text"
                                    value={form.session}
                                    onChange={(e) => setForm({ ...form, session: e.target.value })}
                                    placeholder="সেশন বছর (যেমন: ২০২৩-২০২৪)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    disabled={loading}
                                />
                            </div>

                            {/* অবস্থান ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    অবস্থান
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    disabled={loading}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ভাষা ড্রপডাউন */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ভাষা
                                </label>
                                <select
                                    value={form.language}
                                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    disabled={loading}
                                >
                                    {languages.map(lang => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    প্রিভিউ ইমেজ
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'previewImage')}
                                        className="hidden"
                                        id="previewImage"
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="previewImage"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                                    >
                                        <FaUpload /> আপলোড
                                    </label>
                                    {form.previewImage && (
                                        <span className="text-sm text-green-600">সিলেক্টেড</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    হেডার ইমেজ
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'headerImage')}
                                        className="hidden"
                                        id="headerImage"
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="headerImage"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                                    >
                                        <FaUpload /> আপলোড
                                    </label>
                                    {form.headerImage && (
                                        <span className="text-sm text-green-600">সিলেক্টেড</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ব্যাকগ্রাউন্ড ইমেজ
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'backgroundImage')}
                                        className="hidden"
                                        id="backgroundImage"
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="backgroundImage"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                                    >
                                        <FaUpload /> আপলোড
                                    </label>
                                    {form.backgroundImage && (
                                        <span className="text-sm text-green-600">সিলেক্টেড</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                বিস্তারিত
                            </label>
                            <RichTextEditor
                                value={form.details}
                                onChange={handleRichTextChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="text-center pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-md"
                            >
                                <FaSave /> 
                                {loading ? 'সংরক্ষণ হচ্ছে...' : (editingInstitute ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewInstituteForm;