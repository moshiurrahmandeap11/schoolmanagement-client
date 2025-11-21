import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewExpenseItem from './AddNewExpenseItem/AddNewExpenseItem';


const ExpenseItems = () => {
    const [expenseItems, setExpenseItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch expense items
    const fetchExpenseItems = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/expense-items');
            
            if (response.data && response.data.success) {
                setExpenseItems(response.data.data || []);
            } else {
                setExpenseItems([]);
            }
        } catch (err) {
            setError('এক্সপেন্স আইটেম লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching expense items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenseItems();
    }, []);

    // Handle delete expense item
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি এই আইটেম ডিলিট করতে চান?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`/expense-items/${id}`);
            setError('');
            fetchExpenseItems(); // Refresh list
        } catch (err) {
            setError('আইটেম ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting expense item:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit expense item
    const handleEdit = (item) => {
        // For now, we'll just show an alert. You can implement a proper edit form
        alert(`এডিট করা হবে: ${item.name}`);
        // You can implement edit functionality here
    };

    if (showAddForm) {
        return (
            <AddNewExpenseItem 
                onBack={() => setShowAddForm(false)}
                onSuccess={() => {
                    setShowAddForm(false);
                    fetchExpenseItems();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold ">
                            এক্সপেন্স আইটেম
                        </h1>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Expense Item
                        </MainButton>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader></Loader>
                            </div>
                        ) : expenseItems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SL Number
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্যাটাগরী
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {expenseItems.map((item, index) => (
                                            <tr key={item._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {item.category?.name || item.categoryName || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
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
                        ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                                <p className="text-gray-500">কোন এক্সপেন্স আইটেম পাওয়া যায়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    প্রথম আইটেম যোগ করুন
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseItems;