import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const SalarySheet = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Months in Bengali
    const months = [
        { value: '01', label: 'জানুয়ারি' },
        { value: '02', label: 'ফেব্রুয়ারি' },
        { value: '03', label: 'মার্চ' },
        { value: '04', label: 'এপ্রিল' },
        { value: '05', label: 'মে' },
        { value: '06', label: 'জুন' },
        { value: '07', label: 'জুলাই' },
        { value: '08', label: 'আগস্ট' },
        { value: '09', label: 'সেপ্টেম্বর' },
        { value: '10', label: 'অক্টোবর' },
        { value: '11', label: 'নভেম্বর' },
        { value: '12', label: 'ডিসেম্বর' }
    ];

    // Last 5 years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Fetch teachers data
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/teacher-list');
                
                if (response.data && response.data.success) {
                    setTeachers(response.data.data || []);
                } else {
                    setTeachers([]);
                    setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
                }
            } catch (err) {
                setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching teachers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    // Handle search
    const handleSearch = () => {
        if (!selectedMonth || !selectedYear) {
            setError('মাস এবং বছর নির্বাচন করুন');
            return;
        }
        // Here you would typically make an API call to get salary data
        // For now, we'll just show the teachers list
        setError('');
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            স্যালারি শীট
                        </h1>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Search Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Month */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মাস <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">মাস নির্বাচন করুন</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বছর <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">বছর নির্বাচন করুন</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    থেকে
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পর্যন্ত
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center">
                            <MainButton
                                onClick={handleSearch}
                                disabled={loading}
                                className='rounded-md'
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>খুঁজছি...</span>
                                    </div>
                                ) : (
                                    'খুঁজুন'
                                )}
                            </MainButton>
                        </div>
                    </div>

                    {/* Salary Sheet Section */}
                    <div className="border-t border-gray-200">
                        <div className="px-6 py-4 bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">
                                প্রিন্ট স্যালারি শীট
                            </h2>
                        </div>

                        {/* Teachers Table */}
                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-2 text-gray-600">শিক্ষক ডেটা লোড হচ্ছে...</span>
                                </div>
                            ) : teachers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    আইডি
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    নাম
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    মোবাইল
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Paid Amount
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Salary Names
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {teachers.map((teacher, index) => (
                                                <tr key={teacher._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.smartId || teacher._id}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.mobile}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.salary ? `${parseInt(teacher.salary).toLocaleString('en-BD')} ৳` : '0 ৳'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.designation}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">কোন শিক্ষক পাওয়া যায়নি</p>
                                </div>
                            )}
                        </div>

                        {/* Print Button */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-center">
                                <MainButton
                                    onClick={handlePrint}
                                    className="rounded-md"
                                >
                                    প্রিন্ট করুন
                                </MainButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalarySheet;