import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const CreateSalaryType = ({ editingSalaryType, onClose }) => {
    const [formData, setFormData] = useState({
        salaryName: '',
        amount: '',
        isMonthly: false,
        applicableFrom: '',
        applicableTo: '',
        description: '',
        session: ''
    });
    const [loading, setLoading] = useState(false);

    // Set form data when editing
    useEffect(() => {
        if (editingSalaryType) {
            setFormData({
                salaryName: editingSalaryType.salaryName || '',
                amount: editingSalaryType.amount || '',
                isMonthly: editingSalaryType.isMonthly || false,
                applicableFrom: editingSalaryType.applicableFrom ? new Date(editingSalaryType.applicableFrom).toISOString().split('T')[0] : '',
                applicableTo: editingSalaryType.applicableTo ? new Date(editingSalaryType.applicableTo).toISOString().split('T')[0] : '',
                description: editingSalaryType.description || '',
                session: editingSalaryType.session || ''
            });
        }
    }, [editingSalaryType]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.salaryName.trim() || !formData.amount || !formData.applicableFrom || !formData.session) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields (Salary Name, Amount, Applicable From, Session)'
            });
            return;
        }

        if (formData.amount <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Amount must be greater than 0'
            });
            return;
        }

        try {
            setLoading(true);
            let response;

            if (editingSalaryType) {
                // Update existing salary type
                response = await axiosInstance.put(`/salary-types/${editingSalaryType._id}`, formData);
            } else {
                // Create new salary type
                response = await axiosInstance.post('/salary-types', formData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: editingSalaryType ? 'Salary type updated successfully!' : 'Salary type created successfully!'
                });
                
                // Reset form and close
                setFormData({
                    salaryName: '',
                    amount: '',
                    isMonthly: false,
                    applicableFrom: '',
                    applicableTo: '',
                    description: '',
                    session: ''
                });
                
                if (onClose) {
                    onClose();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to save salary type'
                });
            }
        } catch (error) {
            console.error('Error saving salary type:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to save salary type'
            });
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const sessions = [
        `${currentYear}-${currentYear + 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 3}-${currentYear - 2}`
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {editingSalaryType ? 'Edit Salary Type' : 'Create Salary Type'}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {editingSalaryType ? 'Update existing salary structure' : 'Create new salary structure for teachers and staff'}
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Back to List
                            </button>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Salary Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary Name *
                        </label>
                        <input
                            type="text"
                            name="salaryName"
                            value={formData.salaryName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter salary type name (e.g., Basic Salary, House Rent, Medical Allowance)"
                            required
                        />
                    </div>

                    {/* Amount and Monthly Checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter amount"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isMonthly"
                                checked={formData.isMonthly}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Monthly Salary
                            </label>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salary applicable from date *
                            </label>
                            <input
                                type="date"
                                name="applicableFrom"
                                value={formData.applicableFrom}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salary ends date
                            </label>
                            <input
                                type="date"
                                name="applicableTo"
                                value={formData.applicableTo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Session */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session *
                        </label>
                        <select
                            name="session"
                            value={formData.session}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Session</option>
                            {sessions.map(session => (
                                <option key={session} value={session}>{session}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description - Rich Text Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter salary type description, rules, and conditions..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                        >
                            {loading 
                                ? (editingSalaryType ? 'Updating...' : 'Creating...') 
                                : (editingSalaryType ? 'Update Salary Type' : 'Create Salary Type')
                            }
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    salaryName: '',
                                    amount: '',
                                    isMonthly: false,
                                    applicableFrom: '',
                                    applicableTo: '',
                                    description: '',
                                    session: ''
                                });
                                if (onClose && editingSalaryType) {
                                    onClose();
                                }
                            }}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            {editingSalaryType ? 'Cancel' : 'Reset Form'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSalaryType;