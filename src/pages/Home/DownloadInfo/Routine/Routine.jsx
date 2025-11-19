import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaFileImage, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import MainButton from '../../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';


const AllRoutines = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPublished, setFilterPublished] = useState('all');
    const navigate = useNavigate();
    
    const routinesPerPage = 10;

    useEffect(() => {
        fetchAllRoutines();
    }, [currentPage, searchTerm, filterPublished]);

    const fetchAllRoutines = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/routines');
            
            if (response.data.success) {
                let filteredRoutines = response.data.data;

                // Search filter
                if (searchTerm) {
                    filteredRoutines = filteredRoutines.filter(routine =>
                        routine.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                // Published status filter
                if (filterPublished !== 'all') {
                    const isPublished = filterPublished === 'published';
                    filteredRoutines = filteredRoutines.filter(routine => routine.isPublished === isPublished);
                }

                // Sort by date (newest first)
                filteredRoutines.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Calculate pagination
                const totalRoutines = filteredRoutines.length;
                setTotalPages(Math.ceil(totalRoutines / routinesPerPage));

                // Get current page routines
                const startIndex = (currentPage - 1) * routinesPerPage;
                const currentRoutines = filteredRoutines.slice(startIndex, startIndex + routinesPerPage);
                
                setRoutines(currentRoutines);
            }
        } catch (error) {
            console.error('Error fetching routines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoutineClick = (routine) => {
        if (routine.attachment) {
            const imageUrl = `${baseImageURL}/api/uploads/${routine.attachment.filename}`;
            window.open(imageUrl, '_blank');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAllRoutines();
    };

    const handleFilterChange = (e) => {
        setFilterPublished(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-lg border ${
                        currentPage === i
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-[#1e90c9]"
                        >
                            <FaArrowLeft />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">All Routines</h1>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search routines..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] w-full sm:w-64"
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <MainButton
                                type="submit"
                                className='w-full rounded-md'
                            >
                                Search
                            </MainButton>
                        </form>
                        
                        <select
                            value={filterPublished}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Routines List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : routines.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                File
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {routines.map((routine) => (
                                            <tr 
                                                key={routine._id}
                                                onClick={() => handleRoutineClick(routine)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {routine.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaFileImage className="text-blue-500" />
                                                        <span>{routine.attachment?.originalName || 'No file'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            routine.isPublished
                                                                ? 'bg-[#1e90c9] text-white'
                                                                : 'bg-[#1e90c9] text-yellow-800'
                                                        }`}
                                                    >
                                                        {routine.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <FaCalendarAlt className="text-xs" />
                                                        {formatDate(routine.createdAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden">
                                <div className="p-4 space-y-4">
                                    {routines.map((routine) => (
                                        <div 
                                            key={routine._id}
                                            onClick={() => handleRoutineClick(routine)}
                                            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900 flex-1">
                                                    {routine.title}
                                                </h3>
                                                <span
                                                    className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                                                        routine.isPublished
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {routine.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <FaFileImage className="text-blue-500" />
                                                <span className="truncate">
                                                    {routine.attachment?.originalName || 'No file'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FaCalendarAlt className="text-xs" />
                                                    {formatDate(routine.createdAt)}
                                                </div>
                                                <span className="text-blue-600 text-sm">
                                                    Click to view
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {(currentPage - 1) * routinesPerPage + 1} to{' '}
                                            {Math.min(currentPage * routinesPerPage, routines.length + (currentPage - 1) * routinesPerPage)} of{' '}
                                            {routines.length + (currentPage - 1) * routinesPerPage} results
                                        </div>
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            {renderPagination()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📅</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No routines found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterPublished !== 'all' 
                                    ? 'Try changing your search or filter criteria'
                                    : 'No routines have been created yet'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllRoutines;