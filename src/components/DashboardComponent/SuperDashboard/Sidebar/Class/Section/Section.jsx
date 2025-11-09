import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import AddNewSection from './AddNewSection/AddNewSection';
import EditSection from './EditSection/EditSection';


const Section = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list');
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSection, setEditingSection] = useState(null);

    useEffect(() => {
        if (activeComponent === 'list') {
            fetchSections();
        }
    }, [activeComponent]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/sections');
            
            if (response.data.success) {
                setSections(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'সেকশন লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            showSweetAlert('error', 'সেকশন লোড করতে সমস্যা হয়েছে');
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

    const handleDelete = async (sectionId, sectionName) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${sectionName}" সেকশনটি মুছে ফেলতে চান?`,
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
                const response = await axiosInstance.delete(`/sections/${sectionId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'সেকশন সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchSections();
                } else {
                    showSweetAlert('error', response.data.message || 'সেকশন মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting section:', error);
                showSweetAlert('error', 'সেকশন মুছতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (section) => {
        setEditingSection(section);
        setActiveComponent('edit');
    };

    const filteredSections = sections.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (section.class && section.class.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleBackToList = () => {
        setActiveComponent('list');
        setEditingSection(null);
    };

    if (activeComponent === 'new') {
        return <AddNewSection onBack={handleBackToList} onSuccess={fetchSections} />;
    }

    if (activeComponent === 'edit' && editingSection) {
        return <EditSection 
            section={editingSection} 
            onBack={handleBackToList} 
            onSuccess={fetchSections} 
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
                            সেকশন ব্যবস্থাপনা
                        </h1>
                    </div>
                    
                    <button
                        onClick={() => setActiveComponent('new')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus className="text-sm" />
                        নতুন সেকশন
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    সেকশন খুঁজুন
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="সেকশন নাম বা ক্লাস দ্বারা খুঁজুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                                <div className="text-sm text-gray-600">
                                    মোট সেকশন: {filteredSections.length}
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sections Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">সেকশন লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredSections.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🏫</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {sections.length === 0 ? 'কোন সেকশন পাওয়া যায়নি' : 'ফিল্টারে কোন সেকশন পাওয়া যায়নি'}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {sections.length === 0 
                                        ? 'আপনার প্রথম সেকশন তৈরি করুন।' 
                                        : 'অন্যান্য ফিল্টার চেষ্টা করুন।'
                                    }
                                </p>
                                <button
                                    onClick={() => setActiveComponent('new')}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    সেকশন তৈরি করুন
                                </button>
                            </div>
                        )}

                        {/* Sections Table */}
                        {!loading && filteredSections.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">সেকশনের নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্লাস</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">এডিট</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredSections.map((section) => (
                                            <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <span className="text-blue-600 text-lg">🏫</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {section.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {section.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {section.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleEdit(section)}
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
                                                            onClick={() => handleDelete(section._id, section.name)}
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
                    {!loading && filteredSections.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                দেখানো হচ্ছে {filteredSections.length} টি সেকশন
                                {searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        (খুঁজেছেন: "{searchTerm}")
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

export default Section;