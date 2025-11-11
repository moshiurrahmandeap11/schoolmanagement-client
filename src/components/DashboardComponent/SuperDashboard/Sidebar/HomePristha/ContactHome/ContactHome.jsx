import { useEffect, useState } from 'react';
import { FaEnvelope, FaPhone, FaUser } from 'react-icons/fa';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';


const ContactHome = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // প্রতি পেজে ১০টি আইটেম

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/contact');
            
            if (response.data.success) {
                setContacts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContacts = contacts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(contacts.length / itemsPerPage);

    // Pagination buttons
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Show limited page numbers
    const getVisiblePages = () => {
        const totalPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);
        
        if (endPage - startPage + 1 < totalPagesToShow) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }
        
        return pageNumbers.slice(startPage - 1, endPage);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">যোগাযোগের তথ্য লোড হচ্ছে...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📞</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন যোগাযোগের তথ্য পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm">
                                এখনও কোন যোগাযোগের তথ্য জমা পড়েনি
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                            <FaUser className="text-xl text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">মোট যোগাযোগ</p>
                                            <p className="text-2xl font-bold text-gray-800">{contacts.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                                            <FaPhone className="text-xl text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">বর্তমান পেজ</p>
                                            <p className="text-2xl font-bold text-gray-800">{currentPage}/{totalPages}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                            <FaEnvelope className="text-xl text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">দেখানো হচ্ছে</p>
                                            <p className="text-2xl font-bold text-gray-800">{currentContacts.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-orange-100 rounded-lg mr-4">
                                            <span className="text-xl text-orange-600">📊</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">পেজ সংখ্যা</p>
                                            <p className="text-2xl font-bold text-gray-800">{totalPages}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        যোগাযোগের তালিকা
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    প্রকাশনা (Full Name)
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    মোবাইল
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ইমেইল
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    বিষয়
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    বার্তা
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    তারিখ
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {currentContacts.map((contact) => (
                                                <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <FaUser className="text-blue-600 text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800 text-sm">
                                                                    {contact.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaPhone className="text-gray-400 text-sm" />
                                                            <span className="text-sm text-gray-800 font-mono">
                                                                {contact.mobile}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaEnvelope className="text-gray-400 text-sm" />
                                                            <span className="text-sm text-gray-600">
                                                                {contact.email || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-gray-800 font-medium">
                                                            {contact.subject}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div 
                                                            className="text-sm text-gray-600 max-w-xs cursor-pointer"
                                                            title={contact.message}
                                                        >
                                                            {truncateText(contact.message, 60)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {formatDate(contact.createdAt)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {/* Page Info */}
                                        <div className="text-sm text-gray-600">
                                            দেখানো হচ্ছে {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, contacts.length)} of {contacts.length} যোগাযোগ
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="flex items-center gap-1">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                পূর্ববর্তী
                                            </button>

                                            {/* Page Numbers */}
                                            {getVisiblePages().map(number => (
                                                <button
                                                    key={number}
                                                    onClick={() => paginate(number)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                        currentPage === number
                                                            ? 'bg-blue-500 text-white border border-blue-500'
                                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {number}
                                                </button>
                                            ))}

                                            {/* Next Button */}
                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                পরবর্তী
                                            </button>
                                        </div>

                                        {/* Page Size Info */}
                                        <div className="text-sm text-gray-600">
                                            প্রতি পেজে: {itemsPerPage}
                                        </div>
                                    </div>

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between mt-4 sm:hidden">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            ← পূর্ববর্তী
                                        </button>
                                        
                                        <span className="text-sm text-gray-600">
                                            {currentPage} / {totalPages}
                                        </span>
                                        
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            পরবর্তী →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactHome;