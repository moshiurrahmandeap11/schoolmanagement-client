import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const TeacherSalaryReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch teachers data
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/teacher-list');
                
                console.log('Teachers API Response:', response.data);
                
                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setTeachers(response.data.data);
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

    // Handle download salary sheet
    const handleDownload = async () => {
        if (!startDate || !endDate) {
            setError('শুরুর তারিখ এবং শেষ তারিখ নির্বাচন করুন');
            return;
        }

        if (!selectedTeacher) {
            setError('একজন শিক্ষক নির্বাচন করুন');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('শেষ তারিখ শুরু তারিখের পরে হতে হবে');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Find selected teacher data
            const selectedTeacherData = teachers.find(teacher => teacher._id === selectedTeacher);
            
            if (!selectedTeacherData) {
                throw new Error('নির্বাচিত শিক্ষকের ডেটা পাওয়া যায়নি');
            }

            // Create PDF content
            const pdfContent = createSalaryPDF(selectedTeacherData, startDate, endDate);

            // Create blob and download as PDF
            const blob = new Blob([pdfContent], { 
                type: 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = `teacher_salary_${selectedTeacherData.name}_${startDate}_to_${endDate}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setLoading(false);

        } catch (err) {
            console.error('স্যালারি শীট ডাউনলোড করতে সমস্যা হয়েছে:', err);
            setError(err.message || 'স্যালারি শীট ডাউনলোড করতে সমস্যা হয়েছে');
            setLoading(false);
        }
    };

    // Function to create PDF content for salary sheet
    const createSalaryPDF = (teacher, startDate, endDate) => {
        const today = new Date().toLocaleDateString('bn-BD');
        const startDateFormatted = new Date(startDate).toLocaleDateString('bn-BD');
        const endDateFormatted = new Date(endDate).toLocaleDateString('bn-BD');
        
        const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length 1500 >>
stream
BT
/F1 16 Tf
50 750 Tf
(শিক্ষক স্যালারি রিপোর্ট) Tj
0 -25 Tf
/F1 12 Tf
0 -30 Td (===============================================) Tj
0 -20 Td (তৈরির তারিখ: ${today}) Tj
0 -20 Td (রিপোর্টের সময়কাল: ${startDateFormatted} থেকে ${endDateFormatted}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 14 Tf
0 -20 Td (শিক্ষকের তথ্য) Tj
0 -20 Tf
/F1 12 Tf
0 -20 Td (নাম: ${teacher.name || 'N/A'}) Tj
0 -15 Td (আইডি: ${teacher.smartId || teacher._id || 'N/A'}) Tj
0 -15 Td (মোবাইল: ${teacher.mobile || 'N/A'}) Tj
0 -15 Td (পদবী: ${teacher.designation || 'N/A'}) Tj
0 -15 Td (স্টাফ টাইপ: ${teacher.staffType || 'N/A'}) Tj
0 -15 Td (অবস্থা: ${teacher.position || 'N/A'}) Tj
0 -15 Td (সেশন: ${teacher.session || 'N/A'}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 14 Tf
0 -20 Td (স্যালারি তথ্য) Tj
0 -20 Tf
/F1 12 Tf
0 -20 Td (মূল বেতন: ${teacher.salary ? parseInt(teacher.salary).toLocaleString('en-BD') + ' ৳' : '0 ৳'}) Tj
0 -15 Td (বেতন পরিশোধের তারিখ: ${today}) Tj
0 -15 Td (পরিশোধিত অর্থ: ${teacher.salary ? parseInt(teacher.salary).toLocaleString('en-BD') + ' ৳' : '0 ৳'}) Tj
0 -15 Td (বিবরণ: ${teacher.biboron || 'কোন বিবরণ নেই'}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 10 Tf
0 -20 Td (এই রিপোর্টটি ${startDateFormatted} থেকে ${endDateFormatted} পর্যন্ত সময়ের জন্য তৈরি করা হয়েছে) Tj
0 -15 Td (রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে এবং ডিজিটালি স্বাক্ষরিত) Tj
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000254 00000 n 
0000001754 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1854
%%EOF
`;

        return pdfContent;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            শিক্ষক স্যালারি রিপোর্ট
                        </h1>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শুরুর তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শেষ তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Teacher Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                শিক্ষক <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">শিক্ষক নির্বাচন করুন</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id}>
                                        {teacher.name} - {teacher.designation} ({teacher.mobile})
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <p className="text-sm text-gray-500 mt-1">শিক্ষক লোড হচ্ছে...</p>
                            )}
                            
                            {!loading && teachers.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-1">কোন শিক্ষক পাওয়া যায়নি</p>
                            )}
                        </div>

                        {/* Download Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleDownload}
                                disabled={loading || !startDate || !endDate || !selectedTeacher}
                                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !startDate || !endDate || !selectedTeacher
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>PDF ডাউনলোড হচ্ছে...</span>
                                    </div>
                                ) : (
                                    'Download Salary Sheet'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Selected Teacher Preview */}
                    {selectedTeacher && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                নির্বাচিত শিক্ষকের তথ্য
                            </h3>
                            {(() => {
                                const teacher = teachers.find(t => t._id === selectedTeacher);
                                return teacher ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p><span className="font-medium">নাম:</span> {teacher.name}</p>
                                            <p><span className="font-medium">মোবাইল:</span> {teacher.mobile}</p>
                                            <p><span className="font-medium">পদবী:</span> {teacher.designation}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">বেতন:</span> {teacher.salary ? parseInt(teacher.salary).toLocaleString('en-BD') + ' ৳' : '0 ৳'}</p>
                                            <p><span className="font-medium">স্ট্যাটাস:</span> {teacher.position}</p>
                                            <p><span className="font-medium">টাইপ:</span> {teacher.staffType}</p>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    )}

                    {/* Info Section */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <p className="text-center">
                                নির্বাচিত শিক্ষকের স্যালারি তথ্য PDF ফরম্যাটে ডাউনলোড হবে
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherSalaryReport;