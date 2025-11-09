import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import AddNewSubject from './AddNewSubject/AddNewSubject';
import EditSubject from './EditSubject/EditSubject';


const Subjects = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list');
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filterData, setFilterData] = useState({
        searchTerm: '',
        subjectId: '',
        classId: '',
        sectionId: ''
    });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        if (activeComponent === 'list') {
            fetchSubjects();
            fetchClasses();
            fetchSections();
        }
    }, [activeComponent]);

    const fetchSubjects = async (filters = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.subjectId) params.append('subjectId', filters.subjectId);
            if (filters.classId) params.append('classId', filters.classId);
            if (filters.sectionId) params.append('sectionId', filters.sectionId);

            const response = await axiosInstance.get(`/subjects?${params}`);
            
            if (response.data.success) {
                setSubjects(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'বিষয় লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            showSweetAlert('error', 'বিষয় লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/classes');
            if (response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await axiosInstance.get('/sections');
            if (response.data.success) {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
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

    const handleDelete = async (subjectId, subjectName) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${subjectName}" বিষয়টি মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'না',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/subjects/${subjectId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'বিষয় সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchSubjects();
                } else {
                    showSweetAlert('error', response.data.message || 'বিষয় মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                showSweetAlert('error', 'বিষয় মুছতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setActiveComponent('edit');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        fetchSubjects({
            classId: filterData.classId,
            sectionId: filterData.sectionId
        });
    };

    const handleClearFilter = () => {
        setFilterData({
            searchTerm: '',
            subjectId: '',
            classId: '',
            sectionId: ''
        });
        fetchSubjects();
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(filterData.searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(filterData.searchTerm.toLowerCase()) ||
        (subject.class && subject.class.name.toLowerCase().includes(filterData.searchTerm.toLowerCase())) ||
        (subject.section && subject.section.name.toLowerCase().includes(filterData.searchTerm.toLowerCase()))
    );

    const handleBackToList = () => {
        setActiveComponent('list');
        setEditingSubject(null);
    };

    if (activeComponent === 'new') {
        return <AddNewSubject onBack={handleBackToList} onSuccess={fetchSubjects} />;
    }

    if (activeComponent === 'edit' && editingSubject) {
        return <EditSubject 
            subject={editingSubject} 
            onBack={handleBackToList} 
            onSuccess={fetchSubjects} 
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            বিষয় ব্যবস্থাপনা
                        </h1>
                    </div>
                    
                    <button
                        onClick={() => setActiveComponent('new')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus className="text-sm" />
                        নতুন কারিকুলাম
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Filter Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    অনুসন্ধান
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="searchTerm"
                                        value={filterData.searchTerm}
                                        onChange={handleFilterChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="বিষয়, কোড, ক্লাস বা সেকশন দ্বারা খুঁজুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Class Filter */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    ক্লাস
                                </label>
                                <select
                                    name="classId"
                                    value={filterData.classId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="">সকল ক্লাস</option>
                                    {classes.map(classItem => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section Filter */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    সেকশন
                                </label>
                                <select
                                    name="sectionId"
                                    value={filterData.sectionId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <option value="">সকল সেকশন</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleApplyFilter}
                                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    Apply Filter
                                </button>
                                <button
                                    onClick={handleClearFilter}
                                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">বিষয় লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredSubjects.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📚</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {subjects.length === 0 ? 'কোন বিষয় পাওয়া যায়নি' : 'ফিল্টারে কোন বিষয় পাওয়া যায়নি'}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {subjects.length === 0 
                                        ? 'আপনার প্রথম বিষয় তৈরি করুন।' 
                                        : 'অন্যান্য ফিল্টার চেষ্টা করুন।'
                                    }
                                </p>
                                <button
                                    onClick={() => setActiveComponent('new')}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    বিষয় তৈরি করুন
                                </button>
                            </div>
                        )}

                        {/* Subjects Table */}
                        {!loading && filteredSubjects.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিষয়</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিষয় কোড</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্লাস</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">সেকশন</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">এডিট</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredSubjects.map((subject) => (
                                            <tr key={subject._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                            <span className="text-blue-600 text-lg">📖</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {subject.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {subject.isOptional ? 'ঐচ্ছিক' : 'বাধ্যতামূলক'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {subject.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {subject.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        {subject.section?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleEdit(subject)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleDelete(subject._id, subject.name)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {!loading && filteredSubjects.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                দেখানো হচ্ছে {filteredSubjects.length} টি বিষয়
                                {filterData.searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        (খুঁজেছেন: "{filterData.searchTerm}")
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Subjects;