import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewExpenseItem = ({ onBack, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [expenseItems, setExpenseItems] = useState([{ name: '', category: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch expense categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/expense-category');
                
                if (response.data && response.data.success) {
                    setCategories(response.data.data || []);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                setError('ক্যাটাগরী লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Add new expense item field
    const addExpenseItem = () => {
        setExpenseItems([...expenseItems, { name: '', category: '' }]);
    };

    // Remove expense item field
    const removeExpenseItem = (index) => {
        if (expenseItems.length === 1) {
            setError('কমপক্ষে একটি আইটেম থাকতে হবে');
            return;
        }
        const newItems = expenseItems.filter((_, i) => i !== index);
        setExpenseItems(newItems);
    };

    // Handle input change
    const handleInputChange = (index, field, value) => {
        const newItems = [...expenseItems];
        newItems[index][field] = value;
        setExpenseItems(newItems);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const invalidItems = expenseItems.filter(item => !item.name.trim() || !item.category);
        if (invalidItems.length > 0) {
            setError('সব আইটেমের নাম এবং ক্যাটাগরী পূরণ করুন');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Send data to backend
            const response = await axiosInstance.post('/expense-items', {
                items: expenseItems
            });

            if (response.data && response.data.success) {
                setSuccess('এক্সপেন্স আইটেম সফলভাবে যোগ করা হয়েছে');
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                setError(response.data.message || 'আইটেম সংরক্ষণ করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'আইটেম সংরক্ষণ করতে সমস্যা হয়েছে');
            console.error('Error saving expense items:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            নতুন এক্সপেন্স আইটেম যোগ করুন
                        </h1>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            পিছনে যান
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {expenseItems.map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Expense Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expense Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={item.category}
                                                onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                        {/* Expense Item Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expense Item Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="আইটেমের নাম লিখুন"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Remove button for multiple items */}
                                    {expenseItems.length > 1 && (
                                        <div className="flex justify-end mt-3">
                                            <button
                                                type="button"
                                                onClick={() => removeExpenseItem(index)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                                            >
                                                মুছুন
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <button
                                    type="button"
                                    onClick={addExpenseItem}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Add Another Expense Item
                                </button>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                            loading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>সংরক্ষণ হচ্ছে...</span>
                                            </div>
                                        ) : (
                                            'সংরক্ষণ করুন'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewExpenseItem;