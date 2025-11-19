import { useEffect, useState } from 'react';
import { FaBriefcase, FaEdit, FaPlus, FaTrash, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewAuthors from './AddNewAuthors/AddNewAuthors';


const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingAuthor, setEditingAuthor] = useState(null);

    // Fetch authors
    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/authors');
            
            if (response.data.success) {
                setAuthors(response.data.data);
            } else {
                showSweetAlert('error', response.data.message || 'Failed to load authors');
            }
        } catch (error) {
            console.error('Error fetching authors:', error);
            showSweetAlert('error', 'Failed to load authors: ' + error.message);
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

    const handleAddNew = () => {
        setEditingAuthor(null);
        setActiveTab('new');
    };

    const handleEdit = (author) => {
        setEditingAuthor(author);
        setActiveTab('new');
    };

    const handleDelete = async (authorId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/authors/${authorId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'Author deleted successfully!');
                    fetchAuthors();
                } else {
                    showSweetAlert('error', response.data.message || 'Failed to delete author');
                }
            } catch (error) {
                console.error('Error deleting author:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete author';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingAuthor(null);
        fetchAuthors();
    };

    // Truncate biography for table view
    const truncateBiography = (biography, length = 100) => {
        if (!biography) return 'No biography available';
        const cleanBiography = biography.replace(/<[^>]*>/g, '');
        return cleanBiography.length > length ? cleanBiography.substring(0, length) + '...' : cleanBiography;
    };

    // If activeTab is 'new', show AddNewAuthors component
    if (activeTab === 'new') {
        return (
            <AddNewAuthors 
                editingAuthor={editingAuthor}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            লেখক ব্যবস্থাপনা
                        </h1>
                    </div>

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus className="text-sm" />
                            নতুন লেখক
                        </MainButton>
                    </div>

                    {/* Authors List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && authors.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">✍️</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Authors Found</h3>
                                <p className="text-gray-600 mb-4 text-sm">Get started by adding your first author.</p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    Add Author
                                </button>
                            </div>
                        )}

                        {/* Authors Table */}
                        {!loading && authors.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">পদবি</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">জীবন বৃত্তান্ত</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">এডিট / ডিলিট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {authors.map((author) => (
                                            <tr key={author._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3">
                                                        {author.image ? (
                                                            <img 
                                                                src={`${baseImageURL}${author.image}`}
                                                                alt={author.name}
                                                                className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <FaUser className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{author.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaBriefcase className="text-gray-400" />
                                                        {author.designation || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {truncateBiography(author.biography)}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(author)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(author._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
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
                    {authors.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Authors: {authors.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Authors;