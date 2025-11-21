import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const ClassWiseForm = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch classes, sections, sessions
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                
                // Fetch classes
                const classResponse = await axiosInstance.get('/class');
                if (classResponse.data && classResponse.data.success) {
                    setClasses(classResponse.data.data || []);
                }

                // Fetch sections
                const sectionResponse = await axiosInstance.get('/sections');
                if (sectionResponse.data && Array.isArray(sectionResponse.data)) {
                    setSections(sectionResponse.data);
                } else if (sectionResponse.data && sectionResponse.data.success) {
                    setSections(sectionResponse.data.data || []);
                }

                // Fetch sessions
                const sessionResponse = await axiosInstance.get('/sessions');
                if (sessionResponse.data && Array.isArray(sessionResponse.data)) {
                    setSessions(sessionResponse.data);
                } else if (sessionResponse.data && sessionResponse.data.success) {
                    setSessions(sessionResponse.data.data || []);
                }

            } catch (err) {
                setError('ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch students when class, section, or session changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass) {
                setStudents([]);
                return;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.get('/students', {
                    params: {
                        class: selectedClass,
                        ...(selectedSection && { section: selectedSection }),
                        ...(selectedSession && { session: selectedSession })
                    }
                });

                if (response.data && response.data.success) {
                    setStudents(response.data.data || []);
                } else {
                    setStudents([]);
                }
                
                setSelectedStudents([]); // Reset selected students
            } catch (err) {
                setError('স্টুডেন্ট ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedClass, selectedSection, selectedSession]);

    // Handle student selection
    const handleStudentSelect = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(student => student._id));
        }
    };

    // Handle download certificates
    const handleDownloadCertificates = async () => {
        if (selectedStudents.length === 0) {
            setError('কমপক্ষে একজন স্টুডেন্ট সিলেক্ট করুন');
            return;
        }

        if (!selectedTemplate) {
            setError('সার্টিফিকেট টেমপ্লেট সিলেক্ট করুন');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Get selected students data
            const selectedStudentsData = students.filter(student => 
                selectedStudents.includes(student._id)
            );

            // Create bulk PDF with certificates
            const pdfContent = createBulkCertificates(selectedStudentsData);

            // Create blob and download as PDF
            const blob = new Blob([pdfContent], { 
                type: 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = `student_certificates_${selectedClass}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setLoading(false);

        } catch (err) {
            console.error('সার্টিফিকেট ডাউনলোড করতে সমস্যা হয়েছে:', err);
            setError('সার্টিফিকেট ডাউনলোড করতে সমস্যা হয়েছে');
            setLoading(false);
        }
    };

    // Function to create bulk certificates PDF
    const createBulkCertificates = (studentsData) => {
        let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [`;

        // Add page references for each student
        studentsData.forEach((_, index) => {
            pdfContent += `${3 + index * 2} 0 R `;
        });

        pdfContent += `] /Count ${studentsData.length} >>
endobj`;

        // Create pages for each student
        studentsData.forEach((student, index) => {
            const pageNumber = 3 + index * 2;
            const contentNumber = pageNumber + 1;

            pdfContent += `
${pageNumber} 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentNumber} 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

${contentNumber} 0 obj
<< /Length 1000 >>
stream
BT
/F1 20 Tf
180 650 Tf
(সার্টিফিকেট অফ অ্যাচিভমেন্ট) Tj
0 -30 Tf
/F1 14 Tf
150 600 Tf
(এই সার্টিফিকেটটি প্রদান করা হলো) Tj
0 -40 Tf
/F1 16 Tf
200 550 Tf
(${student.name}) Tj
0 -30 Tf
/F1 12 Tf
180 500 Tf
(ক্লাস: ${student.class?.name || 'N/A'}) Tj
0 -20 Td
(রোল: ${student.classRoll || 'N/A'}) Tj
0 -20 Td
(সেকশন: ${student.section?.name || 'N/A'}) Tj
0 -20 Td
(সেশন: ${student.session?.name || 'N/A'}) Tj
0 -40 Td
(উপরে বর্ণিত শিক্ষার্থীকে তার অত্যন্ত ভালো ফলাফলের জন্য) Tj
0 -20 Td
(এই সার্টিফিকেট প্রদান করা হলো।) Tj
0 -60 Tf
/F1 10 Tf
400 100 Tf
(স্বাক্ষর) Tj
0 -15 Td
(প্রধান শিক্ষক) Tj
ET
endstream
endobj`;
        });

        // Add font object
        pdfContent += `
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 ${3 + studentsData.length * 2}
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n `;

        // Add object references
        let objectOffset = 158;
        studentsData.forEach(() => {
            pdfContent += `
${objectOffset.toString().padStart(10, '0')} 00000 n 
${(objectOffset + 58).toString().padStart(10, '0')} 00000 n `;
            objectOffset += 258;
        });

        pdfContent += `
trailer
<< /Size ${3 + studentsData.length * 2} /Root 1 0 R >>
startxref
${objectOffset}
%%EOF`;

        return pdfContent;
    };

    // Certificate templates (images would be implemented with actual image URLs)
    const certificateTemplates = [
        { id: 'template1', name: 'টেমপ্লেট ১ - সাধারণ সার্টিফিকেট' },
        { id: 'template2', name: 'টেমপ্লেট ২ - রেজাল্ট সার্টিফিকেট' },
        { id: 'template3', name: 'টেমপ্লেট ৩ - অংশগ্রহণ সার্টিফিকেট' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            ক্লাস ওয়াইজ সার্টিফিকেট
                        </h1>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Class */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্লাস <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    সেকশন
                                </label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সেকশন নির্বাচন করুন</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Session */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Active Session
                                </label>
                                <select
                                    value={selectedSession}
                                    onChange={(e) => setSelectedSession(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সেশন নির্বাচন করুন</option>
                                    {sessions.map(session => (
                                        <option key={session._id} value={session._id}>
                                            {session.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Certificate Template */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Certificate Template <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">টেমপ্লেট নির্বাচন করুন</option>
                                    {certificateTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                স্টুডেন্ট লিস্ট ({students.length} জন)
                            </h3>

                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-2 text-gray-600">স্টুডেন্ট ডেটা লোড হচ্ছে...</span>
                                </div>
                            ) : students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.length === students.length && students.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    আইডি
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    নাম
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ক্লাস
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    মোবাইল
                                                </th>
                                                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    প্যারেন্ট মোবাইল
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {students.map((student, index) => (
                                                <tr key={student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student._id)}
                                                            onChange={() => handleStudentSelect(student._id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {student.studentId || student.smartId}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {student.name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {student.class?.name}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {student.mobile}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {student.guardianMobile}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 border border-gray-200 rounded-lg">
                                    <p className="text-gray-500">কোন স্টুডেন্ট পাওয়া যায়নি</p>
                                </div>
                            )}
                        </div>

                        {/* Download Button */}
                        {selectedStudents.length > 0 && (
                            <div className="flex justify-center pt-4">
                                <MainButton
                                    onClick={handleDownloadCertificates}
                                    disabled={loading}
                                    className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#1e90c9] '
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>সার্টিফিকেট তৈরি হচ্ছে...</span>
                                        </div>
                                    ) : (
                                        `Download Certificates (${selectedStudents.length} জন)`
                                    )}
                                </MainButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassWiseForm;