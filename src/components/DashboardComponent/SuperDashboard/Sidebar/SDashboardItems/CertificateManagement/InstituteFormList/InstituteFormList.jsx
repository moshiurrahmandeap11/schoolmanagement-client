import { useEffect, useState } from 'react';
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import NewInstituteForm from './NewInstituteForm/NewInstituteForm';

const InstituteFormListC = () => {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingInstitute, setEditingInstitute] = useState(null);

    useEffect(() => {
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        try {
            setLoading(true);
            // Replace with your actual API endpoint
            const res = await axiosInstance.get('/certificate/institute-forms');
            setInstitutes(res.data.data || []);
        } catch {
            Swal.fire('ত্রুটি!', 'ডেটা লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'নিশ্চিত করুন',
            text: `"${name}" ইনস্টিটিউট মুছে ফেলবেন?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/certificate/institute-forms/${id}`);
                    Swal.fire('মুছে ফেলা হয়েছে!', '', 'success');
                    fetchInstitutes();
                } catch {
                    Swal.fire('ত্রুটি!', 'মুছতে সমস্যা হয়েছে', 'error');
                }
            }
        });
    };

    const handleEdit = (institute) => {
        setEditingInstitute(institute);
        setShowForm(true);
    };

    const handleView = (institute) => {
        Swal.fire({
            title: institute.name,
            html: `
                <div class="text-left">
                    <p><strong>ক্যাটাগরী:</strong> ${institute.category}</p>
                    <p><strong>ক্লাস:</strong> ${institute.class}</p>
                    <p><strong>ব্যাচ:</strong> ${institute.batch}</p>
                    <p><strong>সেকশন:</strong> ${institute.section}</p>
                    <p><strong>সেশন:</strong> ${institute.session}</p>
                    <p><strong>ভাষা:</strong> ${institute.language}</p>
                    <p><strong>অবস্থান:</strong> ${institute.status}</p>
                </div>
            `,
            confirmButtonText: 'ঠিক আছে'
        });
    };

    if (loading) return <Loader />;

    if (showForm) {
        return <NewInstituteForm 
            editingInstitute={editingInstitute} 
            onBack={() => {
                setShowForm(false);
                setEditingInstitute(null);
                fetchInstitutes();
            }} 
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-blue-800">ইনস্টিটিউট ফর্ম তালিকা</h2>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <FaPlus /> নতুন ইনস্টিটিউট ফর্ম
                        </button>
                    </div>

                    {institutes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl text-gray-300 mb-4">🏫</div>
                            <p className="text-lg text-gray-500">কোনো ইনস্টিটিউট ফর্ম তৈরি করা হয়নি</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-blue-700 text-white">
                                        <th className="px-4 py-3 text-left rounded-tl-lg">ক্রম</th>
                                        <th className="px-4 py-3 text-left">ক্যাটাগরী</th>
                                        <th className="px-4 py-3 text-left">ক্লাস</th>
                                        <th className="px-4 py-3 text-left">ব্যাচ</th>
                                        <th className="px-4 py-3 text-left">সেকশন</th>
                                        <th className="px-4 py-3 text-left">সেশন</th>
                                        <th className="px-4 py-3 text-left">ভাষা</th>
                                        <th className="px-4 py-3 text-center rounded-tr-lg">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutes.map((institute, idx) => (
                                        <tr key={institute._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-700">{idx + 1}</td>
                                            <td className="px-4 py-3 text-blue-700 font-semibold">{institute.category}</td>
                                            <td className="px-4 py-3">{institute.class}</td>
                                            <td className="px-4 py-3">{institute.batch}</td>
                                            <td className="px-4 py-3">{institute.section}</td>
                                            <td className="px-4 py-3">{institute.session}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${
                                                    institute.language === 'Bengali' ? 'bg-blue-600' :
                                                    institute.language === 'English' ? 'bg-blue-500' :
                                                    institute.language === 'Arabic' ? 'bg-blue-400' :
                                                    institute.language === 'Hindi' ? 'bg-blue-300' :
                                                    'bg-blue-200'
                                                }`}>
                                                    {institute.language}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(institute)}
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                        title="দেখুন"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(institute)}
                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                        title="এডিট করুন"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(institute._id, institute.name)}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                        title="ডিলিট করুন"
                                                    >
                                                        <FaTrash />
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
            </div>
        </div>
    );
};

export default InstituteFormListC;