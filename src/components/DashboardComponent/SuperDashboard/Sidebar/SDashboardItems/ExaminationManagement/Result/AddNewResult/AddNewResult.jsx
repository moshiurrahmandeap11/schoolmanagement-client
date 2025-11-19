import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewResult = ({ result, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        examCategoryId: '',
        studentId: '',
        studentName: '',
        averageMarks: '',
        averageLetterGrade: '',
        order: '',
        totalAbsent: '',
        totalPresent: '',
        marksheet: ''
    });
    const [addAnother, setAddAnother] = useState(false);

    useEffect(() => {
        fetchDropdownData();
        if (result) {
            setFormData({
                examCategoryId: result.examCategoryId || '',
                studentId: result.studentId || '',
                studentName: result.studentName || '',
                averageMarks: result.averageMarks?.toString() || '',
                averageLetterGrade: result.averageLetterGrade || '',
                order: result.order?.toString() || '',
                totalAbsent: result.totalAbsent?.toString() || '',
                totalPresent: result.totalPresent?.toString() || '',
                marksheet: result.marksheet || ''
            });
        }
    }, [result]);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, studentsRes] = await Promise.all([
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/students')
            ]);

            if (categoriesRes.data.success) setCategories(categoriesRes.data.data || []);
            if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-fill student name when student is selected
        if (name === 'studentId') {
            const selectedStudent = students.find(student => student.studentId === value);
            if (selectedStudent) {
                setFormData(prev => ({
                    ...prev,
                    studentName: selectedStudent.name
                }));
            }
        }
    };

    const validateForm = () => {
        if (!formData.examCategoryId) {
            showSweetAlert('warning', 'পরীক্ষা নির্বাচন করুন');
            return false;
        }

        if (!formData.studentId) {
            showSweetAlert('warning', 'শিক্ষার্থী নির্বাচন করুন');
            return false;
        }

        if (!formData.averageMarks || parseFloat(formData.averageMarks) < 0) {
            showSweetAlert('warning', 'সঠিক গড় মার্কস দিন');
            return false;
        }

        if (!formData.averageLetterGrade) {
            showSweetAlert('warning', 'গড় লেটার গ্রেড দিন');
            return false;
        }

        if (formData.order && parseInt(formData.order) < 0) {
            showSweetAlert('warning', 'ক্রম ০ বা তার বেশি হতে হবে');
            return false;
        }

        if (formData.totalAbsent && parseInt(formData.totalAbsent) < 0) {
            showSweetAlert('warning', 'মোট অনুপস্থিত ০ বা তার বেশি হতে হবে');
            return false;
        }

        if (formData.totalPresent && parseInt(formData.totalPresent) < 0) {
            showSweetAlert('warning', 'মোট উপস্থিত ০ বা তার বেশি হতে হবে');
            return false;
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
                averageMarks: parseFloat(formData.averageMarks),
                order: formData.order ? parseInt(formData.order) : 0,
                totalAbsent: formData.totalAbsent ? parseInt(formData.totalAbsent) : 0,
                totalPresent: formData.totalPresent ? parseInt(formData.totalPresent) : 0
            };

            let response;
            if (result) {
                response = await axiosInstance.put(`/results/${result._id}`, submitData);
            } else {
                response = await axiosInstance.post('/results', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    result ? 'ফলাফল সফলভাবে আপডেট হয়েছে' : 'ফলাফল সফলভাবে তৈরি হয়েছে'
                );
                
                if (addAnother && !result) {
                    // Reset form for adding another result
                    setFormData({
                        examCategoryId: '',
                        studentId: '',
                        studentName: '',
                        averageMarks: '',
                        averageLetterGrade: '',
                        order: '',
                        totalAbsent: '',
                        totalPresent: '',
                        marksheet: ''
                    });
                } else {
                    onSuccess();
                }
            }
        } catch (error) {
            console.error('Error saving result:', error);
            
            if (error.response?.status === 400 && error.response?.data?.message === 'Result already exists for this student and exam category') {
                showSweetAlert('error', 'এই শিক্ষার্থীর জন্য এই পরীক্ষার ফলাফল ইতিমধ্যে রয়েছে');
            } else {
                showSweetAlert('error', 
                    result ? 'ফলাফল আপডেট করতে সমস্যা হয়েছে' : 'ফলাফল তৈরি করতে সমস্যা হয়েছে'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const letterGrades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];

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
                        {result ? 'ফলাফল এডিট করুন' : 'নতুন ফলাফল তৈরি করুন'}
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
                                {/* পরীক্ষা */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        পরীক্ষা *
                                    </label>
                                    <select
                                        name="examCategoryId"
                                        value={formData.examCategoryId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        required
                                    >
                                        <option value="">পরীক্ষা নির্বাচন করুন</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* শিক্ষার্থী */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শিক্ষার্থী *
                                    </label>
                                    <select
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        required
                                    >
                                        <option value="">শিক্ষার্থী নির্বাচন করুন</option>
                                        {students.map(student => (
                                            <option key={student.studentId} value={student.studentId}>
                                                {student.name} - {student.studentId}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Average Marks */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        গড় মার্কস *
                                    </label>
                                    <input
                                        type="number"
                                        name="averageMarks"
                                        value={formData.averageMarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        placeholder="80.5"
                                        step="0.1"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Average Letter Grade */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        গড় লেটার গ্রেড *
                                    </label>
                                    <select
                                        name="averageLetterGrade"
                                        value={formData.averageLetterGrade}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        required
                                    >
                                        <option value="">গ্রেড নির্বাচন করুন</option>
                                        {letterGrades.map(grade => (
                                            <option key={grade} value={grade}>
                                                {grade}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ক্রম
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        placeholder="1"
                                        min="0"
                                    />
                                </div>

                                {/* মোট অনুপস্থিত */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        মোট অনুপস্থিত
                                    </label>
                                    <input
                                        type="number"
                                        name="totalAbsent"
                                        value={formData.totalAbsent}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* মোট উপস্থিত */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        মোট উপস্থিত
                                    </label>
                                    <input
                                        type="number"
                                        name="totalPresent"
                                        value={formData.totalPresent}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* মার্কশিট */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        মার্কশিট লিঙ্ক
                                    </label>
                                    <input
                                        type="url"
                                        name="marksheet"
                                        value={formData.marksheet}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        placeholder="https://example.com/marksheet.pdf"
                                    />
                                </div>
                            </div>

                            {/* Add Another Checkbox (only for new entries) */}
                            {!result && (
                                <div className="mb-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={addAnother}
                                            onChange={(e) => setAddAnother(e.target.checked)}
                                            className="w-4 h-4 text-[#1e90c9] bg-gray-100 border-gray-300 rounded focus:ring-[#1e90c9]"
                                        />
                                        <span className="ml-2 text-gray-700 font-medium text-sm">
                                            সংরক্ষণ করুন এবং অন্য একটি যোগ করুন
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center rounded-md"
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : (result ? 'আপডেট করুন' : 'সেভ করুন')}
                                </MainButton>
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

export default AddNewResult;