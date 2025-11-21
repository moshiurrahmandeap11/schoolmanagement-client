import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewStudentAttendanceShift from './AddNewStudentAttendanceShidt/AddNewStudentAttendanceShift';


const StudentAttendanceShift = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch attendance shifts
    const fetchShifts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/smart-attendance-shift');
            
            if (response.data && response.data.success) {
                setShifts(response.data.data || []);
            } else {
                setShifts([]);
            }
        } catch (err) {
            setError('শিফট ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching shifts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // Handle delete shift
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি এই শিফট ডিলিট করতে চান?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`/smart-attendance-shift/${id}`);
            setError('');
            fetchShifts(); // Refresh list
        } catch (err) {
            setError('শিফট ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting shift:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit shift
    const handleEdit = (shift) => {
        // For now, we'll just show an alert. You can implement a proper edit form
        alert(`এডিট করা হবে: ${shift.shiftName}`);
        // You can implement edit functionality here
    };

    // Handle send SMS
    const handleSendSms = async (shiftId) => {
        try {
            setLoading(true);
            await axiosInstance.post(`/smart-attendance-shift/${shiftId}/send-sms`);
            setError('');
            alert('SMS সফলভাবে পাঠানো হয়েছে');
        } catch (err) {
            setError('SMS পাঠাতে সমস্যা হয়েছে');
            console.error('Error sending SMS:', err);
        } finally {
            setLoading(false);
        }
    };

    if (showAddForm) {
        return (
            <AddNewStudentAttendanceShift 
                onBack={() => setShowAddForm(false)}
                onSuccess={() => {
                    setShowAddForm(false);
                    fetchShifts();
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
                        <h1 className="text-2xl font-bold">
                            স্টুডেন্ট অ্যাটেনডেন্স শিফট
                        </h1>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            New Student Attendance Shift
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
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-gray-600">লোড হচ্ছে...</span>
                            </div>
                        ) : shifts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেকশন
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entry Time
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exit Time
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Late Count
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Early Exit Count
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এস এম এস পাঠান
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {shifts.map((shift, index) => (
                                            <tr key={shift._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.shiftName}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.class?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.section?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.studentEntryTime}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.studentExitTime}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.countLateAfter} মিনিট
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {shift.countEarlyExitBefore} মিনিট
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    <button
                                                        onClick={() => handleSendSms(shift._id)}
                                                        className="px-3 py-1 bg-[#1e90c9] text-white rounded  cursor-pointer text-xs"
                                                    >
                                                        SMS পাঠান
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(shift)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(shift._id)}
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
                                <p className="text-gray-500">কোন শিফট পাওয়া যায়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    প্রথম শিফট যোগ করুন
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceShift;