import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../sharedItems/RichTextEditor/RichTextEditor';
import Loader from '../../../../sharedItems/Loader/Loader';

const BlogsAdmin = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        thumbnail: null,
        body: ''
    });
    const blogsPerPage = 5;

    useEffect(() => {
        fetchBlogs();
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

    // Pagination
    const indexOfLast = currentPage * blogsPerPage;
    const indexOfFirst = indexOfLast - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    const paginate = (page) => setCurrentPage(page);

    // Add Blog Modal
    const openAddModal = () => {
        setFormData({ title: '', thumbnail: null, body: '' });
        setShowAddModal(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, thumbnail: e.target.files[0] });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.thumbnail || !formData.body) {
            Swal.fire('Error!', 'সব ফিল্ড পূরণ করুন', 'error');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('thumbnail', formData.thumbnail);
        data.append('body', formData.body);

        try {
            const response = await axiosInstance.post('/blogs', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                Swal.fire('Success!', 'ব্লগ সফলভাবে যুক্ত হয়েছে', 'success');
                setShowAddModal(false);
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error adding blog:', error);
            Swal.fire('Error!', 'ব্লগ যুক্ত করতে সমস্যা হয়েছে', 'error');
        }
    };
    

    // View Blog
    const viewBlog = (blog) => {
        Swal.fire({
            title: `<strong>${blog.title}</strong>`,
            html: `
                <img src="${baseImageURL}${blog.thumbnail}" class="w-full h-48 object-cover rounded mb-4" />
                <div class="text-left">${blog.body}</div>
            `,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false
        });
    };

    // Edit Blog
    const editBlog = (blog) => {
        setFormData({
            title: blog.title,
            thumbnail: null,
            body: blog.body,
            id: blog._id
        });
        setShowAddModal(true);
    };

    // Update Blog
    const handleUpdate = async () => {
        const data = new FormData();
        data.append('title', formData.title);
        if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);
        data.append('body', formData.body);

        try {
            const response = await axiosInstance.put(`/blogs/${formData.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                Swal.fire('Updated!', 'ব্লগ আপডেট হয়েছে', 'success');
                setShowAddModal(false);
                fetchBlogs();
            }
        } catch  {
            Swal.fire('Error!', 'আপডেট করতে সমস্যা হয়েছে', 'error');
        }
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
            } catch  {
                Swal.fire('Error!', 'মুছতে সমস্যা হয়েছে', 'error');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Blogs Management</h1>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        + Add New Blog
                    </button>
                </div>

                {/* Blog Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thumbnail</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentBlogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={`${baseImageURL}${blog.thumbnail}`}
                                            alt={blog.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">
                                        {blog.title}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => viewBlog(blog)}
                                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => editBlog(blog)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteBlog(blog._id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                            >
                                                Delete
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

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {formData.id ? 'Edit Blog' : 'Add New Blog'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Blog Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter blog title"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Thumbnail Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                {formData.id && formData.thumbnail === null && (
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Blog Body</label>
                                <RichTextEditor
                                    value={formData.body}
                                    onChange={(content) => setFormData({ ...formData, body: content })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={formData.id ? handleUpdate : handleSubmit}
                                    className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium"
                                >
                                    {formData.id ? 'Update Blog' : 'Add Blog'}
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogsAdmin;