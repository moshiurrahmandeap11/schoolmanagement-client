import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEye, FaPlus, FaPrint, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewHomeWork from './AddNewHomeWork/AddNewHomeWork';


const Assignments = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list');
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeComponent === 'list') {
            fetchAssignments();
        }
    }, [activeComponent]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/assignments');
            
            if (response.data.success) {
                setAssignments(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'হোমওয়ার্ক লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            showSweetAlert('error', 'হোমওয়ার্ক লোড করতে সমস্যা হয়েছে');
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

    const handleDelete = async (assignmentId, assignmentTitle) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${assignmentTitle}" হোমওয়ার্কটি মুছে ফেলতে চান?`,
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
                const response = await axiosInstance.delete(`/assignments/${assignmentId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'হোমওয়ার্ক সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchAssignments();
                } else {
                    showSweetAlert('error', response.data.message || 'হোমওয়ার্ক মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                showSweetAlert('error', 'হোমওয়ার্ক মুছতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePrint = (assignment) => {
        // Print functionality
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${assignment.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .details { margin-bottom: 20px; }
                        .detail-item { margin-bottom: 8px; }
                        .homework-details { margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${assignment.title}</h1>
                    </div>
                    <div class="details">
                        <div class="detail-item"><strong>ক্লাস:</strong> ${assignment.class?.name || 'N/A'}</div>
                        <div class="detail-item"><strong>শিক্ষক:</strong> ${assignment.teacher?.name || 'N/A'}</div>
                        <div class="detail-item"><strong>সেকশন:</strong> ${assignment.section?.name || 'N/A'}</div>
                        <div class="detail-item"><strong>তারিখ:</strong> ${new Date(assignment.homeworkDate).toLocaleDateString('bn-BD')}</div>
                        <div class="detail-item"><strong>অবস্থান:</strong> ${assignment.status === 'publish' ? 'প্রকাশিত' : 'খসড়া'}</div>
                    </div>
                    <div class="homework-details">
                        <h3>হোমওয়ার্ক বিবরণ:</h3>
                        ${assignment.homeworkDetails && assignment.homeworkDetails.length > 0 
                            ? assignment.homeworkDetails.map(detail => `
                                <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #007bff;">
                                    <strong>বিষয়:</strong> ${detail.subjectName || 'N/A'}<br/>
                                    <strong>ধরণ:</strong> ${getHomeworkTypeText(detail.homeworkType)}<br/>
                                    <strong>বিবরণ:</strong> ${detail.homeworkText ? detail.homeworkText.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'কোন বিবরণ নেই'}
                                </div>
                            `).join('')
                            : '<p>কোন হোমওয়ার্ক বিবরণ নেই</p>'
                        }
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleView = (assignment) => {
        Swal.fire({
            title: assignment.title,
            html: `
                <div style="text-align: left;">
                    <p><strong>ক্লাস:</strong> ${assignment.class?.name || 'N/A'}</p>
                    <p><strong>শিক্ষক:</strong> ${assignment.teacher?.name || 'N/A'}</p>
                    <p><strong>সেকশন:</strong> ${assignment.section?.name || 'N/A'}</p>
                    <p><strong>তারিখ:</strong> ${new Date(assignment.homeworkDate).toLocaleDateString('bn-BD')}</p>
                    <p><strong>অবস্থান:</strong> ${assignment.status === 'publish' ? 'প্রকাশিত' : 'খসড়া'}</p>
                    <hr/>
                    <h4>হোমওয়ার্ক বিবরণ:</h4>
                    ${assignment.homeworkDetails && assignment.homeworkDetails.length > 0 
                        ? assignment.homeworkDetails.map(detail => `
                            <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #007bff;">
                                <strong>বিষয়:</strong> ${detail.subjectName || 'N/A'}<br/>
                                <strong>ধরণ:</strong> ${getHomeworkTypeText(detail.homeworkType)}<br/>
                                <strong>বিবরণ:</strong> ${detail.homeworkText ? detail.homeworkText.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'কোন বিবরণ নেই'}
                            </div>
                        `).join('')
                        : '<p>কোন হোমওয়ার্ক বিবরণ নেই</p>'
                    }
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: '600px'
        });
    };

    const getHomeworkTypeText = (type) => {
        switch (type) {
            case 'written': return 'লিখিত';
            case 'oral': return 'মৌখিক';
            case 'written_oral': return 'লিখিত ও মৌখিক';
            default: return type;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'publish':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">প্রকাশিত</span>;
            case 'draft':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">খসড়া</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignment.class && assignment.class.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (assignment.teacher && assignment.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (assignment.section && assignment.section.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleBackToList = () => {
        setActiveComponent('list');
    };

    if (activeComponent === 'new') {
        return <AddNewHomeWork onBack={handleBackToList} onSuccess={fetchAssignments} />;
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
                            হোমওয়ার্ক ব্যবস্থাপনা
                        </h1>
                    </div>
                    
                    <MainButton
                        onClick={() => setActiveComponent('new')}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন হোমওয়ার্ক
                    </MainButton>
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
                                    হোমওয়ার্ক খুঁজুন
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                        placeholder="শিরোনাম, ক্লাস, শিক্ষক বা সেকশন দ্বারা খুঁজুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                                <div className="text-sm text-gray-600">
                                    মোট হোমওয়ার্ক: {filteredAssignments.length}
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

                    {/* Assignments Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">হোমওয়ার্ক লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredAssignments.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📚</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {assignments.length === 0 ? 'কোন হোমওয়ার্ক পাওয়া যায়নি' : 'ফিল্টারে কোন হোমওয়ার্ক পাওয়া যায়নি'}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {assignments.length === 0 
                                        ? 'আপনার প্রথম হোমওয়ার্ক তৈরি করুন।' 
                                        : 'অন্যান্য ফিল্টার চেষ্টা করুন।'
                                    }
                                </p>
                                <MainButton
                                    onClick={() => setActiveComponent('new')}
                                >
                                    হোমওয়ার্ক তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Assignments Table */}
                        {!loading && filteredAssignments.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিরোনাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্লাস</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিক্ষক</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">অবস্থান</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submission Date</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">সংযোজন</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">প্রিন্ট</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAssignments.map((assignment) => (
                                            <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="max-w-xs">
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {assignment.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {assignment.section?.name && `সেকশন: ${assignment.section.name}`}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {assignment.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {assignment.teacher?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(assignment.status)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(assignment.homeworkDate)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        {assignment.attachments && assignment.attachments.length > 0 ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {assignment.attachments.length} ফাইল
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">কোন সংযোজন নেই</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handlePrint(assignment)}
                                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs flex items-center gap-1"
                                                            title="প্রিন্ট করুন"
                                                        >
                                                            <FaPrint className="text-xs" />
                                                            প্রিন্ট
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleView(assignment)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                            title="দেখুন"
                                                        >
                                                            <FaEye className="text-xs" />
                                                            দেখুন
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(assignment._id, assignment.title)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                            title="মুছুন"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            মুছুন
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
                    {!loading && filteredAssignments.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                দেখানো হচ্ছে {filteredAssignments.length} টি হোমওয়ার্ক
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

export default Assignments;