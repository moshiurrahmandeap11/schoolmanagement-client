import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../sharedItems/Loader/Loader';
import AddBlog from './AddBlog/AddBlog';

const BlogsAdmin = () => {
    const [blogs, setBlogs] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingBlog, setEditingBlog] = useState(null);
    const blogsPerPage = 5;

    useEffect(() => {
        fetchBlogs();
        fetchTeachers();
        fetchAuthors();
        fetchCategories();
    }, [currentPage]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/blogs');
            if (response.data.success) {
                setBlogs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            Swal.fire('Error!', 'ব্লগ লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axiosInstance.get('/teacher-list');
            if (response.data.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await axiosInstance.get('/authors');
            if (response.data.success) {
                setAuthors(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching authors:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/categories');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([
                { _id: '1', name: 'প্রযুক্তি' },
                { _id: '2', name: 'শিক্ষা' },
                { _id: '3', name: 'স্বাস্থ্য' },
                { _id: '4', name: 'খেলাধুলা' }
            ]);
        }
    };

    // Pagination
    const indexOfLast = currentPage * blogsPerPage;
    const indexOfFirst = indexOfLast - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    const paginate = (page) => setCurrentPage(page);

    // Navigate to Add Blog
    const openAddBlog = () => {
        setEditingBlog(null);
        setActiveTab('new');
    };

    // Navigate to Edit Blog
    const editBlog = (blog) => {
        setEditingBlog(blog);
        setActiveTab('new');
    };

    // Delete Blog
    const deleteBlog = async (id) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: 'এই ব্লগ মুছে ফেলতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'না'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/blogs/${id}`);
                if (response.data.success) {
                    Swal.fire('Deleted!', 'ব্লগ মুছে ফেলা হয়েছে', 'success');
                    fetchBlogs();
                }
            } catch {
                Swal.fire('Error!', 'মুছতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingBlog(null);
        fetchBlogs();
    };

    // Helper function to get name by ID
    const getNameById = (id, list) => {
        const item = list.find(item => item._id === id);
        return item ? item.name : 'N/A';
    };

    // If activeTab is 'new', show AddBlog component
    if (activeTab === 'new') {
        return (
            <AddBlog 
                editingBlog={editingBlog}
                onBack={handleBack}
                teachers={teachers}
                authors={authors}
                categories={categories}
            />
        );
    }

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">ব্লগ ব্যবস্থাপনা</h1>
                    <button
                        onClick={openAddBlog}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        + নতুন ব্লগ
                    </button>
                </div>

                {/* Blog Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিরোনাম</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">লেখক</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">অবস্থান</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন্স</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentBlogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                                        <div className="font-medium">{blog.title}</div>
                                        {blog.thumbnail && (
                                            <img
                                                src={`${baseImageURL}${blog.thumbnail}`}
                                                alt={blog.title}
                                                className="w-16 h-16 object-cover rounded mt-2"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {getNameById(blog.author, authors)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 max-w-md">
                                        <div 
                                            className="truncate"
                                            dangerouslySetInnerHTML={{ __html: blog.description?.substring(0, 100) + '...' }}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            blog.status === 'Published' 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {blog.status || 'Draft'}
                                        </span>
                                        <div className="mt-1 space-y-1">
                                            {blog.isPremium && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Premium</span>
                                            )}
                                            {blog.isFeatured && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Featured</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => editBlog(blog)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                            >
                                                এডিট
                                            </button>
                                            <button
                                                onClick={() => deleteBlog(blog._id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                            >
                                                ডিলিট
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-4 py-2 rounded font-medium transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogsAdmin;