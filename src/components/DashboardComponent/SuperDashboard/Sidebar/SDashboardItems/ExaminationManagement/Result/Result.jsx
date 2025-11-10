import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import AddNewResult from './AddNewResult/AddNewResult';


const Result = ({ onBack }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchData, setSearchData] = useState({
        studentId: '',
        studentName: '',
        examCategoryId: 'all'
    });
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        if (!showAddForm) {
            fetchDropdownData();
            fetchResults();
        }
    }, [showAddForm]);

    const fetchDropdownData = async () => {
        try {
            const response = await axiosInstance.get('/exam-categories');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showSweetAlert('error', 'পরীক্ষার ধরণ লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/results');
            
            if (response.data.success) {
                setResults(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            showSweetAlert('error', 'ফলাফল লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (result) => {
        setEditingResult(result);
        setShowAddForm(true);
    };

    const handleDelete = async (resultId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই ফলাফলটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/results/${resultId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'ফলাফল সফলভাবে ডিলিট হয়েছে');
                    fetchResults();
                    if (showSearchResults) {
                        handleSearch();
                    }
                }
            } catch (error) {
                console.error('Error deleting result:', error);
                showSweetAlert('error', 'ফলাফল ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleAddNew = () => {
        setEditingResult(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingResult(null);
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async () => {
        if (!searchData.studentId && !searchData.studentName) {
            showSweetAlert('warning', 'শিক্ষার্থীর আইডি বা নাম দিন');
            return;
        }

        try {
            setSearchLoading(true);
            const params = new URLSearchParams();
            
            if (searchData.studentId) params.append('studentId', searchData.studentId);
            if (searchData.studentName) params.append('studentName', searchData.studentName);
            if (searchData.examCategoryId !== 'all') params.append('examCategoryId', searchData.examCategoryId);

            const response = await axiosInstance.get(`/results?${params}`);
            
            if (response.data.success) {
                setSearchResults(response.data.data || []);
                setShowSearchResults(true);
                
                if (response.data.data.length === 0) {
                    showSweetAlert('info', 'কোন ফলাফল পাওয়া যায়নি');
                }
            }
        } catch (error) {
            console.error('Error searching results:', error);
            showSweetAlert('error', 'ফলাফল খুঁজতে সমস্যা হয়েছে');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchData({
            studentId: '',
            studentName: '',
            examCategoryId: 'all'
        });
        setShowSearchResults(false);
        setSearchResults([]);
    };

    const handleViewMarksheet = (marksheet) => {
        if (marksheet) {
            window.open(marksheet, '_blank');
        } else {
            showSweetAlert('info', 'কোন মার্কশিট নেই');
        }
    };

    const getGradeColor = (grade) => {
        const gradeColors = {
            'A+': 'bg-green-100 text-green-800',
            'A': 'bg-green-100 text-green-800',
            'A-': 'bg-blue-100 text-blue-800',
            'B': 'bg-yellow-100 text-yellow-800',
            'C': 'bg-orange-100 text-orange-800',
            'D': 'bg-red-100 text-red-800',
            'F': 'bg-red-100 text-red-800'
        };
        return gradeColors[grade] || 'bg-gray-100 text-gray-800';
    };

    const displayResults = showSearchResults ? searchResults : results;

    if (showAddForm) {
        return (
            <AddNewResult 
                result={editingResult}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingResult(null);
                    fetchResults();
                }}
            />
        );
    }

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
                            ফলাফল ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        <FaPlus className="text-sm" />
                        নতুন ফলাফল
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                <div className="max-w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* শিক্ষার্থীর আইডি */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                শিক্ষার্থীর আইডি
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentId"
                                    value={searchData.studentId}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থী আইডি"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* শিক্ষার্থীর নাম */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                শিক্ষার্থীর নাম
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentName"
                                    value={searchData.studentName}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থীর নাম"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* পরীক্ষা */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                পরীক্ষা
                            </label>
                            <select
                                name="examCategoryId"
                                value={searchData.examCategoryId}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                <option value="all">সকল পরীক্ষা</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSearch className="text-sm" />
                            {searchLoading ? 'অনুসন্ধান হচ্ছে...' : 'অনুসন্ধান'}
                        </button>
                        {showSearchResults && (
                            <button
                                onClick={handleClearSearch}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                খুঁজা বাতিল করুন
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">ফলাফল লোড হচ্ছে...</p>
                        </div>
                    ) : displayResults.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {showSearchResults ? 'কোন ফলাফল পাওয়া যায়নি' : 'কোন ফলাফল পাওয়া যায়নি'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {showSearchResults ? 'অনুসন্ধান করুন বা নতুন ফলাফল তৈরি করুন' : 'নতুন ফলাফল তৈরি করুন'}
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন ফলাফল তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {showSearchResults ? 'অনুসন্ধান ফলাফল' : 'সকল ফলাফল'} ({displayResults.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষার্থী
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পরীক্ষা
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                গড় মার্কস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                গড় গ্রেড
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্রম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অনুপস্থিত
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মার্কশিট
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অ্যাকশন
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {displayResults.map((result) => (
                                            <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {result.studentName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {result.studentId}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {result.examCategoryName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm font-medium">
                                                        {result.averageMarks}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.averageLetterGrade)}`}>
                                                        {result.averageLetterGrade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {result.order}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {result.totalAbsent} দিন
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleViewMarksheet(result.marksheet)}
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                            result.marksheet 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        } transition-colors`}
                                                    >
                                                        {result.marksheet ? (
                                                            <>
                                                                <FaEye className="text-xs" />
                                                                দেখুন
                                                            </>
                                                        ) : (
                                                            'নেই'
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(result)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(result._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Result;