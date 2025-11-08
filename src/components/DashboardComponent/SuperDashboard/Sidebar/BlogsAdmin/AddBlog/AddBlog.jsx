import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import RichTextEditor from '../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddBlog = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        teacher: '',
        author: '',
        category: '',
        description: '',
        thumbnail: null,
        status: 'Draft',
        isPremium: false,
        isFeatured: false,
        tags: ''
    });

    useEffect(() => {
        fetchTeachers();
        fetchAuthors();
        fetchCategories();
    }, []);

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

    const handleFileChange = (e) => {
        setFormData({ ...formData, thumbnail: e.target.files[0] });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            Swal.fire('Error!', 'সব প্রয়োজনীয় ফিল্ড পূরণ করুন', 'error');
            return;
        }

        if (!formData.thumbnail) {
            Swal.fire('Error!', 'থাম্বনেইল ইমেজ আবশ্যক', 'error');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('teacher', formData.teacher);
        data.append('author', formData.author);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('thumbnail', formData.thumbnail);
        data.append('status', formData.status);
        data.append('isPremium', formData.isPremium);
        data.append('isFeatured', formData.isFeatured);
        data.append('tags', formData.tags);

        try {
            const response = await axiosInstance.post('/blogs', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                Swal.fire('Success!', 'ব্লগ সফলভাবে যুক্ত হয়েছে', 'success');
            }
        } catch (error) {
            console.error('Error adding blog:', error);
            Swal.fire('Error!', 'ব্লগ যুক্ত করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/blogs'); // Redirect back to blogs list
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Add New Blog</h1>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">শিক্ষক</label>
                                <select
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">শিক্ষক নির্বাচন করুন</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">লেখক</label>
                                <select
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">লেখক নির্বাচন করুন</option>
                                    {authors.map(author => (
                                        <option key={author._id} value={author._id}>
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">ক্যাটাগরী নাম</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">ক্যাটাগরী নির্বাচন করুন</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">অবস্থান</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">শিরোনাম *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ব্লগের শিরোনাম লিখুন"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">ছবি *</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">বিবরণ *</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(content) => setFormData({ ...formData, description: content })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isPremium"
                                    checked={formData.isPremium}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-gray-700 font-medium">Is Premium</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-gray-700 font-medium">Is Featured</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tags (Enter দ্বারা আলাদা করুন)</label>
                            <textarea
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="প্রতিটি ট্যাগ Enter চাপে আলাদা করুন"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Adding Blog...' : 'Add Blog'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBlog;