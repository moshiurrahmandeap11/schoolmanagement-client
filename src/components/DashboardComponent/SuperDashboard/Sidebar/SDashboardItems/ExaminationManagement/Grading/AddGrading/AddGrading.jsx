import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddGrading = ({ grading, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        totalMarks: '',
        passMarks: '33.0',
        optionalSubjectDeduction: '2.0',
        isSpecialGrading: false,
        gradeRanges: [
            { letterGrade: 'A+', minMarks: '80', maxMarks: '100', gradePoint: '5.0' },
            { letterGrade: 'A', minMarks: '70', maxMarks: '79', gradePoint: '4.0' },
            { letterGrade: 'A-', minMarks: '60', maxMarks: '69', gradePoint: '3.5' },
            { letterGrade: 'B', minMarks: '50', maxMarks: '59', gradePoint: '3.0' },
            { letterGrade: 'C', minMarks: '40', maxMarks: '49', gradePoint: '2.0' },
            { letterGrade: 'D', minMarks: '33', maxMarks: '39', gradePoint: '1.0' },
            { letterGrade: 'F', minMarks: '0', maxMarks: '32', gradePoint: '0.0' }
        ]
    });

    useEffect(() => {
        if (grading) {
            setFormData({
                name: grading.name || '',
                totalMarks: grading.totalMarks?.toString() || '',
                passMarks: grading.passMarks?.toString() || '33.0',
                optionalSubjectDeduction: grading.optionalSubjectDeduction?.toString() || '2.0',
                isSpecialGrading: grading.isSpecialGrading || false,
                gradeRanges: grading.gradeRanges?.map(range => ({
                    letterGrade: range.letterGrade,
                    minMarks: range.minMarks?.toString(),
                    maxMarks: range.maxMarks?.toString(),
                    gradePoint: range.gradePoint?.toString()
                })) || []
            });
        }
    }, [grading]);

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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGradeRangeChange = (index, field, value) => {
        const updatedGradeRanges = [...formData.gradeRanges];
        updatedGradeRanges[index] = {
            ...updatedGradeRanges[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            gradeRanges: updatedGradeRanges
        }));
    };

    const addGradeRange = () => {
        setFormData(prev => ({
            ...prev,
            gradeRanges: [
                ...prev.gradeRanges,
                { letterGrade: '', minMarks: '', maxMarks: '', gradePoint: '' }
            ]
        }));
    };

    const removeGradeRange = (index) => {
        if (formData.gradeRanges.length <= 1) {
            showSweetAlert('warning', 'অন্তত একটি গ্রেড রেঞ্জ থাকতে হবে');
            return;
        }

        setFormData(prev => ({
            ...prev,
            gradeRanges: prev.gradeRanges.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showSweetAlert('warning', 'গ্রেডিং সিস্টেমের নাম প্রয়োজন');
            return false;
        }

        if (!formData.totalMarks || parseFloat(formData.totalMarks) <= 0) {
            showSweetAlert('warning', 'সঠিক মোট নাম্বার দিন');
            return false;
        }

        if (!formData.passMarks || parseFloat(formData.passMarks) < 0) {
            showSweetAlert('warning', 'সঠিক পাস মার্কস দিন');
            return false;
        }

        if (formData.gradeRanges.length === 0) {
            showSweetAlert('warning', 'অন্তত একটি গ্রেড রেঞ্জ যোগ করুন');
            return false;
        }

        for (let i = 0; i < formData.gradeRanges.length; i++) {
            const range = formData.gradeRanges[i];
            if (!range.letterGrade.trim()) {
                showSweetAlert('warning', `${i + 1} নং গ্রেডের লেটার গ্রেড প্রয়োজন`);
                return false;
            }
            if (!range.minMarks || !range.maxMarks || parseFloat(range.minMarks) < 0 || parseFloat(range.maxMarks) < 0) {
                showSweetAlert('warning', `${i + 1} নং গ্রেডের সঠিক মার্ক রেঞ্জ দিন`);
                return false;
            }
            if (!range.gradePoint || parseFloat(range.gradePoint) < 0) {
                showSweetAlert('warning', `${i + 1} নং গ্রেডের সঠিক গ্রেড পয়েন্ট দিন`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                totalMarks: parseFloat(formData.totalMarks),
                passMarks: parseFloat(formData.passMarks),
                optionalSubjectDeduction: parseFloat(formData.optionalSubjectDeduction),
                gradeRanges: formData.gradeRanges.map(range => ({
                    ...range,
                    minMarks: parseFloat(range.minMarks),
                    maxMarks: parseFloat(range.maxMarks),
                    gradePoint: parseFloat(range.gradePoint)
                }))
            };

            let response;
            if (grading) {
                response = await axiosInstance.put(`/grading/${grading._id}`, submitData);
            } else {
                response = await axiosInstance.post('/grading', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    grading ? 'গ্রেডিং সিস্টেম সফলভাবে আপডেট হয়েছে' : 'গ্রেডিং সিস্টেম সফলভাবে তৈরি হয়েছে'
                );
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving grading system:', error);
            showSweetAlert('error', 
                grading ? 'গ্রেডিং সিস্টেম আপডেট করতে সমস্যা হয়েছে' : 'গ্রেডিং সিস্টেম তৈরি করতে সমস্যা হয়েছে'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {grading ? 'গ্রেডিং সিস্টেম এডিট করুন' : 'নতুন গ্রেডিং সিস্টেম তৈরি করুন'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* নাম */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        নাম *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="গ্রেডিং সিস্টেমের নাম"
                                        required
                                    />
                                </div>

                                {/* মোট নাম্বার */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        মোট নাম্বার *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="100"
                                        step="0.1"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Pass Marks */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        পাস মার্কস *
                                    </label>
                                    <input
                                        type="number"
                                        name="passMarks"
                                        value={formData.passMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="33.0"
                                        step="0.1"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* ঐচ্ছিক বিষয় বিয়োগ পয়েন্ট */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ঐচ্ছিক বিষয় বিয়োগ পয়েন্ট
                                    </label>
                                    <input
                                        type="number"
                                        name="optionalSubjectDeduction"
                                        value={formData.optionalSubjectDeduction}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="2.0"
                                        step="0.1"
                                        min="0"
                                    />
                                </div>

                                {/* Is Special Grading */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isSpecialGrading"
                                            checked={formData.isSpecialGrading}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-gray-700 font-medium text-sm">
                                            বিশেষ গ্রেডিং সিস্টেম
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Grade Ranges */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        গ্রেডিং মার্কস
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addGradeRange}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                    >
                                        <FaPlus className="text-xs" />
                                        আরও যোগ করুন
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.gradeRanges.map((range, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                                            {/* লেটার গ্রেড */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-xs">
                                                    লেটার গ্রেড *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={range.letterGrade}
                                                    onChange={(e) => handleGradeRangeChange(index, 'letterGrade', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    placeholder="A+"
                                                    required
                                                />
                                            </div>

                                            {/* মার্ক রেঞ্জ */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-xs">
                                                    সর্বনিম্ন মার্ক *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={range.minMarks}
                                                    onChange={(e) => handleGradeRangeChange(index, 'minMarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    placeholder="0"
                                                    step="0.1"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-xs">
                                                    সর্বোচ্চ মার্ক *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={range.maxMarks}
                                                    onChange={(e) => handleGradeRangeChange(index, 'maxMarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    placeholder="100"
                                                    step="0.1"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* গ্রেড পয়েন্ট এবং ডিলিট বাটন */}
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-gray-700 font-medium mb-2 text-xs">
                                                        গ্রেড পয়েন্ট *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={range.gradePoint}
                                                        onChange={(e) => handleGradeRangeChange(index, 'gradePoint', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                        placeholder="5.0"
                                                        step="0.1"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                {formData.gradeRanges.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGradeRange(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ডিলিট করুন"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : (grading ? 'আপডেট করুন' : 'সেভ করুন')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGrading;