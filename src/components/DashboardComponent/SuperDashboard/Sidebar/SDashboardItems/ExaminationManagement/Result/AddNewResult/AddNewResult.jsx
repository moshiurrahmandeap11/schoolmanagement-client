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
        examCategoryName: '',  // নতুন যোগ করলাম
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
                examCategoryName: result.examCategoryName || '', // এটাও সেট করা হচ্ছে
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
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // যখন পরীক্ষা সিলেক্ট করবে, তখন নামও সেট করবে
            if (name === 'examCategoryId') {
                const selectedCategory = categories.find(cat => cat._id === value);
                updated.examCategoryName = selectedCategory?.name || '';
            }

            // যখন শিক্ষার্থী সিলেক্ট করবে, নাম অটো ফিল
            if (name === 'studentId') {
                const selectedStudent = students.find(s => s.studentId === value);
                updated.studentName = selectedStudent?.name || '';
            }

            return updated;
        });
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
        return true;
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        setLoading(true);

        const submitData = {
            examCategoryId: formData.examCategoryId,
            examCategoryName: formData.examCategoryName,
            studentId: formData.studentId,
            studentName: formData.studentName,
            averageMarks: parseFloat(formData.averageMarks),
            averageLetterGrade: formData.averageLetterGrade,
            order: formData.order ? parseInt(formData.order) : null,
            totalAbsent: formData.totalAbsent ? parseInt(formData.totalAbsent) : 0,
            totalPresent: formData.totalPresent ? parseInt(formData.totalPresent) : 0,
            marksheet: formData.marksheet || null
        };

        let newResultId = result?._id; // যদি এডিট হয়

        // ১. রেজাল্ট সেভ/আপডেট করি
        if (result) {
            await axiosInstance.put(`/results/${result._id}`, submitData);
        } else {
            const createRes = await axiosInstance.post('/results', submitData);
            newResultId = createRes.data.data._id; // নতুন রেজাল্টের আইডি
        }

        // ২. ছাত্রের ডকুমেন্টে রেজাল্টের আইডি পুশ করি (ডুপ্লিকেট হবে না)
        if (newResultId) {
            await axiosInstance.patch(`/students/student/${formData.studentId}/results`, {
                fullResult: submitData,
            });
            // অথবা যদি তোমার API এইভাবে হয়:
            // await axiosInstance.put(`/students/${formData.studentId}`, {
            //     $addToSet: { results: newResultId }
            // });
        }

        showSweetAlert('success', 
            result ? 'ফলাফল সফলভাবে আপডেট হয়েছে' : 'ফলাফল সফলভাবে তৈরি হয়েছে'
        );

        if (addAnother && !result) {
            setFormData({
                examCategoryId: '',
                examCategoryName: '',
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

    } catch (error) {
        console.error('Error saving result or updating student:', error);
        const msg = error.response?.data?.message || 'কিছু একটা ভুল হয়েছে';
        showSweetAlert('error', msg);
    } finally {
        setLoading(false);
    }
};

    const letterGrades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {result ? 'ফলাফল এডিট করুন' : 'নতুন ফলাফল তৈরি করুন'}
                    </h1>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* পরীক্ষা */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">পরীক্ষা *</label>
                                    <select
                                        name="examCategoryId"
                                        value={formData.examCategoryId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        required
                                    >
                                        <option value="">পরীক্ষা নির্বাচন করুন</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* শিক্ষার্থী */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">শিক্ষার্থী *</label>
                                    <select
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        required
                                    >
                                        <option value="">শিক্ষার্থী নির্বাচন করুন</option>
                                        {students.map(s => (
                                            <option key={s.studentId} value={s.studentId}>
                                                {s.name} - {s.studentId}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* বাকি ফিল্ডগুলো আগের মতোই... */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">গড় মার্কস *</label>
                                    <input type="number" name="averageMarks" value={formData.averageMarks} onChange={handleInputChange} step="0.1" min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" required />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">গড় লেটার গ্রেড *</label>
                                    <select name="averageLetterGrade" value={formData.averageLetterGrade} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" required>
                                        <option value="">গ্রেড নির্বাচন করুন</option>
                                        {letterGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">ক্রম</label>
                                    <input type="number" name="order" value={formData.order} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মোট অনুপস্থিত</label>
                                    <input type="number" name="totalAbsent" value={formData.totalAbsent} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মোট উপস্থিত</label>
                                    <input type="number" name="totalPresent" value={formData.totalPresent} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মার্কশিট লিঙ্ক</label>
                                    <input type="url" name="marksheet" value={formData.marksheet} onChange={handleInputChange} placeholder="https://example.com/marksheet.pdf" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" />
                                </div>
                            </div>

                            {!result && (
                                <div className="mb-6">
                                    <label className="flex items-center">
                                        <input type="checkbox" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} className="w-4 h-4 text-[#1e90c9] rounded" />
                                        <span className="ml-2 text-gray-700 font-medium text-sm">সংরক্ষণ করুন এবং অন্য একটি যোগ করুন</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <MainButton type="submit" disabled={loading} className="flex-1">
                                    <FaSave className="mr-2" />
                                    {loading ? 'সেভ হচ্ছে...' : (result ? 'আপডেট করুন' : 'সেভ করুন')}
                                </MainButton>
                                <button type="button" onClick={onBack} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
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