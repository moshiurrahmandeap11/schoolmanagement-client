import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTrash, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddExpenses = ({ expense, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        note: '',
        paymentStatus: 'Cash',
        voucher: null,
        expenseItems: [
            {
                expenseCategoryId: '',
                expenseItemId: '',
                quantity: 1,
                amount: '',
                subtotal: '',
                description: ''
            }
        ],
        totalAmount: 0
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [expenseItems, setExpenseItems] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        if (expense) {
            setFormData({
                accountId: expense.accountId || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                description: expense.description || '',
                note: expense.note || '',
                paymentStatus: expense.paymentStatus || 'Cash',
                voucher: null,
                expenseItems: expense.expenseItems || [
                    {
                        expenseCategoryId: '',
                        expenseItemId: '',
                        quantity: 1,
                        amount: '',
                        subtotal: '',
                        description: ''
                    }
                ],
                totalAmount: expense.totalAmount || 0
            });
            if (expense.voucher) {
                setFilePreview(expense.voucher);
            }
        }
        fetchDropdownData();
    }, [expense]);

    const fetchDropdownData = async () => {
        try {
            // Fetch expense categories
            const categoriesResponse = await axiosInstance.get('/expense-category');
            if (categoriesResponse.data.success) {
                setExpenseCategories(categoriesResponse.data.data);
            }

            // Fetch expense items/heads
            const itemsResponse = await axiosInstance.get('/expense-heads');
            if (itemsResponse.data.success) {
                setExpenseItems(itemsResponse.data.data);
            }

            // Fetch bank accounts
            const accountsResponse = await axiosInstance.get('/bank-accounts');
            if (accountsResponse.data.success) {
                setBankAccounts(accountsResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleExpenseItemChange = (index, field, value) => {
        const updatedItems = [...formData.expenseItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Calculate subtotal when quantity or amount changes
        if (field === 'quantity' || field === 'amount') {
            const quantity = field === 'quantity' ? parseInt(value) || 0 : parseInt(updatedItems[index].quantity) || 0;
            const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].amount) || 0;
            updatedItems[index].subtotal = (quantity * amount).toFixed(2);
        }

        setFormData(prev => ({
            ...prev,
            expenseItems: updatedItems
        }));

        // Recalculate total amount
        calculateTotalAmount(updatedItems);
    };

    const calculateTotalAmount = (items) => {
        const total = items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
        setFormData(prev => ({
            ...prev,
            totalAmount: total
        }));
    };

    const addExpenseItem = () => {
        setFormData(prev => ({
            ...prev,
            expenseItems: [
                ...prev.expenseItems,
                {
                    expenseCategoryId: '',
                    expenseItemId: '',
                    quantity: 1,
                    amount: '',
                    subtotal: '',
                    description: ''
                }
            ]
        }));
    };

    const removeExpenseItem = (index) => {
        if (formData.expenseItems.length > 1) {
            const updatedItems = formData.expenseItems.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                expenseItems: updatedItems
            }));
            calculateTotalAmount(updatedItems);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                voucher: file
            }));
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.accountId) {
            newErrors.accountId = 'একাউন্ট নির্বাচন করুন';
        }
        
        if (!formData.date) {
            newErrors.date = 'তারিখ প্রয়োজন';
        }

        if (formData.expenseItems.length === 0) {
            newErrors.expenseItems = 'কমপক্ষে একটি খরচের আইটেম যোগ করুন';
        }

        // Validate each expense item
        formData.expenseItems.forEach((item, index) => {
            if (!item.expenseCategoryId) {
                newErrors[`expenseCategory_${index}`] = 'খরচের ক্যাটাগরি নির্বাচন করুন';
            }
            if (!item.expenseItemId) {
                newErrors[`expenseItem_${index}`] = 'খরচের আইটেম নির্বাচন করুন';
            }
            if (!item.amount || item.amount <= 0) {
                newErrors[`amount_${index}`] = 'সঠিক পরিমাণ প্রয়োজন';
            }
        });

        if (formData.totalAmount <= 0) {
            newErrors.totalAmount = 'সঠিক মোট পরিমাণ প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            
            submitData.append('accountId', formData.accountId);
            submitData.append('date', formData.date);
            submitData.append('description', formData.description);
            submitData.append('note', formData.note);
            submitData.append('paymentStatus', formData.paymentStatus);
            submitData.append('totalAmount', formData.totalAmount);
            submitData.append('expenseItems', JSON.stringify(formData.expenseItems));
            
            if (formData.voucher) {
                submitData.append('voucher', formData.voucher);
            }

            let response;
            
            if (expense) {
                response = await axiosInstance.put(`/expenses/${expense._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/expenses', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            const errorMessage = error.response?.data?.message || 'খরচ সংরক্ষণ করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredExpenseItems = (categoryId) => {
        if (!categoryId) return [];
        return expenseItems.filter(item => item.categoryId === categoryId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {expense ? 'খরচ এডিট করুন' : 'নতুন খরচ যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Expense Details:</h3>
                            </div>

                            {/* Expense Items Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-gray-800">Expense Items</h4>
                                    <button
                                        type="button"
                                        onClick={addExpenseItem}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <FaPlus className="text-sm" />
                                        Add More Expense Item
                                    </button>
                                </div>

                                {formData.expenseItems.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="font-medium text-gray-800">Item {index + 1}</h5>
                                            {formData.expenseItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeExpenseItem(index)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Expense Category */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expense Category *
                                                </label>
                                                <select
                                                    value={item.expenseCategoryId}
                                                    onChange={(e) => handleExpenseItemChange(index, 'expenseCategoryId', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors[`expenseCategory_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                                    {expenseCategories.map(category => (
                                                        <option key={category._id} value={category._id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`expenseCategory_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`expenseCategory_${index}`]}</p>
                                                )}
                                            </div>

                                            {/* Expense Item */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expense Item *
                                                </label>
                                                <select
                                                    value={item.expenseItemId}
                                                    onChange={(e) => handleExpenseItemChange(index, 'expenseItemId', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors[`expenseItem_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">আইটেম নির্বাচন করুন</option>
                                                    {getFilteredExpenseItems(item.expenseCategoryId).map(expenseItem => (
                                                        <option key={expenseItem._id} value={expenseItem._id}>
                                                            {expenseItem.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`expenseItem_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`expenseItem_${index}`]}</p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleExpenseItemChange(index, 'quantity', e.target.value)}
                                                    min="1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* পরিমাণ */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    পরিমাণ *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => handleExpenseItemChange(index, 'amount', e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors[`amount_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                    placeholder="পরিমাণ"
                                                />
                                                {errors[`amount_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`amount_${index}`]}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subtotal and Description */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Subtotal
                                                </label>
                                                <input
                                                    type="text"
                                                    value={`৳${item.subtotal || '0.00'}`}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    বিবরণ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleExpenseItemChange(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="আইটেম বিবরণ"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Amount */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-yellow-800">Total Amount:</span>
                                    <span className="text-2xl font-bold text-yellow-800">
                                        ৳{formData.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                {errors.totalAmount && (
                                    <p className="mt-2 text-sm text-red-600">{errors.totalAmount}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Payment Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Status
                                    </label>
                                    <select
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Due">Due</option>
                                    </select>
                                </div>

                                {/* একাউন্টসমূহ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        একাউন্টসমূহ *
                                    </label>
                                    <select
                                        name="accountId"
                                        value={formData.accountId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.accountId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">একাউন্ট নির্বাচন করুন</option>
                                        {bankAccounts.map(account => (
                                            <option key={account._id} value={account._id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.accountId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>
                                    )}
                                </div>

                                {/* তারিখ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.date && (
                                        <p className="mt-2 text-sm text-red-600">{errors.date}</p>
                                    )}
                                </div>

                                {/* Voucher */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Voucher
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="voucher-upload"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <label
                                            htmlFor="voucher-upload"
                                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <FaUpload className="text-sm" />
                                            {formData.voucher ? 'ফাইল পরিবর্তন করুন' : 'ফাইল আপলোড করুন'}
                                        </label>
                                        {formData.voucher && (
                                            <p className="text-sm text-green-600 mt-2">
                                                {formData.voucher.name}
                                            </p>
                                        )}
                                        {filePreview && formData.voucher?.type?.startsWith('image/') && (
                                            <div className="mt-2">
                                                <img 
                                                    src={filePreview} 
                                                    alt="Preview" 
                                                    className="max-h-32 mx-auto rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ছবি, PDF, ডকুমেন্ট (সর্বোচ্চ ১০MB)
                                    </p>
                                </div>
                            </div>

                            {/* বিবরণ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="খরচের বিবরণ লিখুন"
                                />
                            </div>

                            {/* নোট */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    নোট
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="অতিরিক্ত নোট লিখুন"
                                />
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {expense ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {expense ? 'আপডেট করুন' : 'আরও যোগ করুন'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddExpenses;