import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';

const AddNewResult = ({ result, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        examCategoryId: '',
        examCategoryName: '',
        studentId: '',
        studentName: '',
        averageMarks: '',
        averageLetterGrade: '',
        order: '',
        totalAbsent: '',
        totalPresent: '',
        marksheet: '',
        subjectMarks: [] // নতুন যোগ করলাম
    });
    const [addAnother, setAddAnother] = useState(false);

    useEffect(() => {
        fetchDropdownData();
        if (result) {
            setFormData({
                examCategoryId: result.examCategoryId || '',
                examCategoryName: result.examCategoryName || '',
                studentId: result.studentId || '',
                studentName: result.studentName || '',
                averageMarks: result.averageMarks?.toString() || '',
                averageLetterGrade: result.averageLetterGrade || '',
                order: result.order?.toString() || '',
                totalAbsent: result.totalAbsent?.toString() || '',
                totalPresent: result.totalPresent?.toString() || '',
                marksheet: result.marksheet || '',
                subjectMarks: result.subjectMarks || [] // নতুন যোগ করলাম
            });
        }
    }, [result]);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, studentsRes, subjectsRes] = await Promise.all([
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/students'),
                axiosInstance.get('/subjects') // নতুন যোগ করলাম
            ]);

            if (categoriesRes.data.success) setCategories(categoriesRes.data.data || []);
            if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
            if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []); // নতুন যোগ করলাম
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

            if (name === 'examCategoryId') {
                const selectedCategory = categories.find(cat => cat._id === value);
                updated.examCategoryName = selectedCategory?.name || '';
            }

            if (name === 'studentId') {
                const selectedStudent = students.find(s => s.studentId === value);
                updated.studentName = selectedStudent?.name || '';
            }

            return updated;
        });
    };

    // বিষয়ভিত্তিক মার্কস হ্যান্ডলার
    const handleSubjectMarksChange = (index, field, value) => {
        setFormData(prev => {
            const updatedSubjectMarks = [...prev.subjectMarks];
            updatedSubjectMarks[index] = {
                ...updatedSubjectMarks[index],
                [field]: value
            };

            // টোটাল মার্কস অটো ক্যালকুলেট
            if (field === 'cqMarks' || field === 'mcqMarks' || field === 'practicalMarks') {
                const cq = parseFloat(updatedSubjectMarks[index]?.cqMarks) || 0;
                const mcq = parseFloat(updatedSubjectMarks[index]?.mcqMarks) || 0;
                const practical = parseFloat(updatedSubjectMarks[index]?.practicalMarks) || 0;
                const total = cq + mcq + practical;
                
                updatedSubjectMarks[index] = {
                    ...updatedSubjectMarks[index],
                    totalMarks: total > 0 ? total.toString() : ''
                };
            }

            return {
                ...prev,
                subjectMarks: updatedSubjectMarks
            };
        });
    };

    // নতুন বিষয় যোগ
    const addNewSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjectMarks: [
                ...prev.subjectMarks,
                {
                    subjectId: '',
                    subjectName: '',
                    cqMarks: '',
                    mcqMarks: '',
                    practicalMarks: '',
                    totalMarks: '',
                    letterGrade: ''
                }
            ]
        }));
    };

    // বিষয় রিমুভ
    const removeSubject = (index) => {
        setFormData(prev => ({
            ...prev,
            subjectMarks: prev.subjectMarks.filter((_, i) => i !== index)
        }));
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
                marksheet: formData.marksheet || null,
                subjectMarks: formData.subjectMarks.map(subject => ({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    cqMarks: subject.cqMarks ? parseFloat(subject.cqMarks) : null,
                    mcqMarks: subject.mcqMarks ? parseFloat(subject.mcqMarks) : null,
                    practicalMarks: subject.practicalMarks ? parseFloat(subject.practicalMarks) : null,
                    totalMarks: subject.totalMarks ? parseFloat(subject.totalMarks) : null,
                    letterGrade: subject.letterGrade || ''
                }))
            };

            let newResultId = result?._id;

            if (result) {
                await axiosInstance.put(`/results/${result._id}`, submitData);
            } else {
                const createRes = await axiosInstance.post('/results', submitData);
                newResultId = createRes.data.data._id;
            }

            // ছাত্রের ডকুমেন্টে রেজাল্ট আপডেট
            if (newResultId) {
                await axiosInstance.patch(`/students/student/${formData.studentId}/results`, {
                    fullResult: submitData,
                });
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
                    marksheet: '',
                    subjectMarks: []
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

                                {/* গড় মার্কস */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">গড় মার্কস *</label>
                                    <input 
                                        type="number" 
                                        name="averageMarks" 
                                        value={formData.averageMarks} 
                                        onChange={handleInputChange} 
                                        step="0.1" 
                                        min="0" 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                        required 
                                    />
                                </div>

                                {/* গড় লেটার গ্রেড */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">গড় লেটার গ্রেড *</label>
                                    <select 
                                        name="averageLetterGrade" 
                                        value={formData.averageLetterGrade} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                        required
                                    >
                                        <option value="">গ্রেড নির্বাচন করুন</option>
                                        {letterGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                {/* ক্রম */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">ক্রম</label>
                                    <input 
                                        type="number" 
                                        name="order" 
                                        value={formData.order} 
                                        onChange={handleInputChange} 
                                        min="0" 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                    />
                                </div>

                                {/* মোট অনুপস্থিত */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মোট অনুপস্থিত</label>
                                    <input 
                                        type="number" 
                                        name="totalAbsent" 
                                        value={formData.totalAbsent} 
                                        onChange={handleInputChange} 
                                        min="0" 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                    />
                                </div>

                                {/* মোট উপস্থিত */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মোট উপস্থিত</label>
                                    <input 
                                        type="number" 
                                        name="totalPresent" 
                                        value={formData.totalPresent} 
                                        onChange={handleInputChange} 
                                        min="0" 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                    />
                                </div>

                                {/* মার্কশিট লিঙ্ক */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">মার্কশিট লিঙ্ক</label>
                                    <input 
                                        type="url" 
                                        name="marksheet" 
                                        value={formData.marksheet} 
                                        onChange={handleInputChange} 
                                        placeholder="https://example.com/marksheet.pdf" 
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]" 
                                    />
                                </div>
                            </div>

                            {/* বিষয়ভিত্তিক মার্কস সেকশন */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">বিষয়ভিত্তিক মার্কস</h3>
                                    <button
                                        type="button"
                                        onClick={addNewSubject}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <FaPlus className="text-sm" />
                                        নতুন বিষয় যোগ করুন
                                    </button>
                                </div>

                                {formData.subjectMarks.map((subject, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium text-gray-700">বিষয় #{index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* বিষয় সিলেক্ট */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">বিষয় *</label>
                                                <select
                                                    value={subject.subjectId}
                                                    onChange={(e) => {
                                                        const selectedSubject = subjects.find(s => s._id === e.target.value);
                                                        handleSubjectMarksChange(index, 'subjectId', e.target.value);
                                                        handleSubjectMarksChange(index, 'subjectName', selectedSubject?.name || '');
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                    required
                                                >
                                                    <option value="">বিষয় নির্বাচন করুন</option>
                                                    {subjects.map(sub => (
                                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* CQ মার্কস */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">CQ মার্কস</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={subject.cqMarks}
                                                    onChange={(e) => handleSubjectMarksChange(index, 'cqMarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                    placeholder="CQ মার্কস"
                                                />
                                            </div>

                                            {/* MCQ মার্কস */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">MCQ মার্কস</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={subject.mcqMarks}
                                                    onChange={(e) => handleSubjectMarksChange(index, 'mcqMarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                    placeholder="MCQ মার্কস"
                                                />
                                            </div>

                                            {/* প্র্যাকটিক্যাল মার্কস */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">প্র্যাকটিক্যাল মার্কস</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={subject.practicalMarks}
                                                    onChange={(e) => handleSubjectMarksChange(index, 'practicalMarks', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                    placeholder="প্র্যাকটিক্যাল মার্কস"
                                                />
                                            </div>

                                            {/* টোটাল মার্কস (অটো ক্যালকুলেটেড) */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">মোট মার্কস</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={subject.totalMarks}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                                    placeholder="অটো ক্যালকুলেটেড"
                                                />
                                            </div>

                                            {/* লেটার গ্রেড */}
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2 text-sm">লেটার গ্রেড</label>
                                                <select
                                                    value={subject.letterGrade}
                                                    onChange={(e) => handleSubjectMarksChange(index, 'letterGrade', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                                >
                                                    <option value="">গ্রেড নির্বাচন করুন</option>
                                                    {letterGrades.map(grade => (
                                                        <option key={grade} value={grade}>{grade}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {formData.subjectMarks.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500">কোন বিষয় যোগ করা হয়নি</p>
                                        <button
                                            type="button"
                                            onClick={addNewSubject}
                                            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            প্রথম বিষয় যোগ করুন
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!result && (
                                <div className="mb-6">
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={addAnother} 
                                            onChange={(e) => setAddAnother(e.target.checked)} 
                                            className="w-4 h-4 text-[#1e90c9] rounded" 
                                        />
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