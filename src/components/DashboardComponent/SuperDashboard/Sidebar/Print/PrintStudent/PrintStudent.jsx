import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const PrintStudent = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const downloadStudentsData = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch students data from API
                const response = await axiosInstance.get('/students');
                
                console.log('API Response:', response.data);

                // Check if response data is valid
                if (!response.data) {
                    throw new Error('ডেটা পাওয়া যায়নি');
                }

                // Convert JSON data to formatted PDF content
                const studentsData = response.data.data || response.data;
                
                if (!studentsData || studentsData.length === 0) {
                    throw new Error('কোন স্টুডেন্ট ডেটা পাওয়া যায়নি');
                }

                // Create PDF content
                const pdfContent = createPDFContent(studentsData);

                // Create blob and download as PDF
                const blob = new Blob([pdfContent], { 
                    type: 'application/pdf' 
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const fileName = `students_data_class_wise_${new Date().toISOString().split('T')[0]}.pdf`;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                setLoading(false);

            } catch (error) {
                console.error('স্টুডেন্ট ডেটা ডাউনলোড করতে সমস্যা হয়েছে:', error);
                setError('স্টুডেন্ট ডেটা ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
                setLoading(false);

                // Fallback: Create a simple PDF with error message
                try {
                    const fallbackContent = createErrorPDF(error.message);
                    const blob = new Blob([fallbackContent], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `students_data_error_${new Date().toISOString().split('T')[0]}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                } catch (fallbackError) {
                    console.error('ফলব্যাক ডাউনলোডেও সমস্যা:', fallbackError);
                }
            }
        };

        downloadStudentsData();
    }, []);

    // Function to create PDF content from student data
    const createPDFContent = (students) => {
        const today = new Date().toLocaleDateString('bn-BD');
        
        let content = `
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
<< /Length 1000 >>
stream
BT
/F1 12 Tf
`;

        // Header
        content += `50 750 Td (ক্লাস ওয়াইজ স্টুডেন্ট লিস্ট) Tj\n`;
        content += `0 -20 Td (তৈরির তারিখ: ${today}) Tj\n`;
        content += `0 -30 Td (মোট স্টুডেন্ট: ${students.length}) Tj\n`;
        content += `0 -40 Td (===================================) Tj\n`;

        // Student data
        students.forEach((student, index) => {
            const yPosition = 650 - (index * 60);
            
            if (yPosition < 50) {
                // Add new page if needed
                content += `ET\nendstream\nendobj\n`;
                content += `6 0 obj\n<< /Length 500 >>\nstream\nBT\n/F1 12 Tf\n`;
                content += `50 750 Td (পৃষ্ঠা ২) Tj\n`;
                content += `0 -20 Td (===================================) Tj\n`;
            }

            content += `0 -40 Td (স্টুডেন্ট ${index + 1}:) Tj\n`;
            content += `0 -15 Td (নাম: ${student.name || 'N/A'}) Tj\n`;
            content += `0 -15 Td (রোল: ${student.roll || 'N/A'}) Tj\n`;
            content += `0 -15 Td (ক্লাস: ${student.class || student.grade || 'N/A'}) Tj\n`;
            content += `0 -15 Td (সেকশন: ${student.section || 'N/A'}) Tj\n`;
            content += `0 -10 Td (------------------------) Tj\n`;
        });

        content += `ET
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
0000001354 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1853
%%EOF
`;

        return content;
    };

    // Function to create error PDF
    const createErrorPDF = (errorMessage) => {
        return `
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
<< /Length 500 >>
stream
BT
/F1 14 Tf
50 750 Td (স্টুডেন্ট ডেটা ডাউনলোড এরর) Tj
0 -30 Tf
0 -40 Td (দুঃখিত, স্টুডেন্ট ডেটা লোড করতে সমস্যা হয়েছে) Tj
0 -30 Tf
0 -40 Td (এরর মেসেজ: ${errorMessage}) Tj
0 -30 Tf
0 -60 Td (দয়া করে নিচের কাজগুলো চেষ্টা করুন:) Tj
0 -30 Tf
0 -40 Td (১. ইন্টারনেট কানেকশন চেক করুন) Tj
0 -30 Tf
0 -40 Td (২. পৃষ্ঠাটি রিফ্রেশ করুন) Tj
0 -30 Tf
0 -40 Td (৩. আবার চেষ্টা করুন) Tj
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
0000000754 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
854
%%EOF
`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    PDF ডাউনলোড হচ্ছে...
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    ক্লাস ওয়াইজ স্টুডেন্ট লিস্ট PDF তৈরি করা হচ্ছে
                                </p>
                                <div className="flex space-x-2 justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {!loading && !error && (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    PDF ডাউনলোড সম্পূর্ণ!
                                </h2>
                                <p className="text-gray-600 mb-2">
                                    স্টুডেন্ট ডেটা PDF সফলভাবে ডাউনলোড হয়েছে
                                </p>
                                <p className="text-sm text-gray-500">
                                    আপনার ডাউনলোড ফোল্ডারে PDF ফাইলটি চেক করুন
                                </p>
                            </div>

                            <MainButton
                                onClick={() => window.location.reload()}
                            >
                                আবার ডাউনলোড করুন
                            </MainButton>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    ডাউনলোড ব্যর্থ
                                </h2>
                                <p className="text-red-600 mb-4">
                                    {error}
                                </p>
                            </div>

                            <div className="flex space-x-4">
                                <MainButton
                                    onClick={() => window.location.reload()}
                                >
                                    আবার চেষ্টা করুন
                                </MainButton>
                                <button
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    পিছনে যান
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-[#1e90c9] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div className="text-sm text-[#1e90c9]">
                                <p className="font-medium">সহায়তা:</p>
                                <p className="mt-1">স্টুডেন্ট ডেটা PDF ফরম্যাটে ডাউনলোড হবে। যদি ডাউনলোড শুরু না হয়, তাহলে ব্রাউজারের পপ-আপ ব্লকার চেক করুন।</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintStudent;