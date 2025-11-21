import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const EmployeeSalaryReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch employees data
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/teacher-list');
                
                console.log('Employees API Response:', response.data.data);
                
                // Handle different response structures
                let employeesData = [];
                
                if (response.data && Array.isArray(response.data)) {
                    employeesData = response.data;
                } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    employeesData = response.data.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    employeesData = response.data.data;
                } else if (response.data && typeof response.data === 'object') {
                    employeesData = Object.values(response.data);
                }
                
                // Filter only staffType === "staff"
                const staffEmployees = (employeesData || []).filter(employee => 
                    employee.staffType === "Staff"
                );
                
                setEmployees(staffEmployees);
                
            } catch (err) {
                setError('এমপ্লয়ী ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching employees:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);
    console.log(employees);

    // Handle download salary report
    const handleDownload = async () => {
        if (!startDate || !endDate) {
            setError('শুরুর তারিখ এবং শেষ তারিখ নির্বাচন করুন');
            return;
        }

        if (!selectedEmployee) {
            setError('একজন এমপ্লয়ী নির্বাচন করুন');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('শেষ তারিখ শুরু তারিখের পরে হতে হবে');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Find selected employee data
            const selectedEmployeeData = employees.find(employee => employee._id === selectedEmployee);
            
            if (!selectedEmployeeData) {
                throw new Error('নির্বাচিত এমপ্লয়ীর ডেটা পাওয়া যায়নি');
            }

            // Create PDF content
            const pdfContent = createSalaryPDF(selectedEmployeeData, startDate, endDate);

            // Create blob and download as PDF
            const blob = new Blob([pdfContent], { 
                type: 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const fileName = `employee_salary_${selectedEmployeeData.name || 'employee'}_${startDate}_to_${endDate}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setLoading(false);

        } catch (err) {
            console.error('স্যালারি রিপোর্ট ডাউনলোড করতে সমস্যা হয়েছে:', err);
            setError(err.message || 'স্যালারি রিপোর্ট ডাউনলোড করতে সমস্যা হয়েছে');
            setLoading(false);
        }
    };

    // Function to create PDF content for salary report
    const createSalaryPDF = (employee, startDate, endDate) => {
        const today = new Date().toLocaleDateString('bn-BD');
        const startDateFormatted = new Date(startDate).toLocaleDateString('bn-BD');
        const endDateFormatted = new Date(endDate).toLocaleDateString('bn-BD');
        
        // Employee data with fallbacks
        const empName = employee.name || employee.employeeName || 'N/A';
        const empId = employee.employeeId || employee.smartId || employee._id || 'N/A';
        const empMobile = employee.mobile || employee.phone || 'N/A';
        const empDesignation = employee.designation || employee.position || 'N/A';
        const empSalary = employee.salary || employee.basicSalary || '0';
        const empDepartment = employee.department || employee.dept || 'N/A';
        const empType = employee.employeeType || employee.type || employee.staffType || 'N/A';
        const empStatus = employee.status || employee.position || 'Active';

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
<< /Length 2000 >>
stream
BT
/F1 18 Tf
50 750 Tf
(Employee Salary Report) Tj
0 -25 Tf
/F1 12 Tf
0 -30 Td (===============================================) Tj
0 -20 Td (তৈরির তারিখ: ${today}) Tj
0 -20 Td (রিপোর্টের সময়কাল: ${startDateFormatted} থেকে ${endDateFormatted}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 14 Tf
0 -20 Td (এমপ্লয়ীর তথ্য) Tj
0 -20 Tf
/F1 12 Tf
0 -20 Td (নাম: ${empName}) Tj
0 -15 Td (এমপ্লয়ী আইডি: ${empId}) Tj
0 -15 Td (মোবাইল: ${empMobile}) Tj
0 -15 Td (পদবী: ${empDesignation}) Tj
0 -15 Td (ডিপার্টমেন্ট: ${empDepartment}) Tj
0 -15 Td (এমপ্লয়ী টাইপ: ${empType}) Tj
0 -15 Td (স্ট্যাটাস: ${empStatus}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 14 Tf
0 -20 Td (স্যালারি তথ্য) Tj
0 -20 Tf
/F1 12 Tf
0 -20 Td (মূল বেতন: ${parseInt(empSalary).toLocaleString('en-BD')} ৳) Tj
0 -15 Td (বেতন পরিশোধের তারিখ: ${today}) Tj
0 -15 Td (পরিশোধিত অর্থ: ${parseInt(empSalary).toLocaleString('en-BD')} ৳) Tj
0 -15 Td (রিপোর্ট পিরিয়ড: ${startDateFormatted} - ${endDateFormatted}) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 14 Tf
0 -20 Td (বেতন বিবরণী) Tj
0 -20 Tf
/F1 12 Tf
0 -20 Td (বেসিক স্যালারি: ${parseInt(empSalary).toLocaleString('en-BD')} ৳) Tj
0 -15 Td (হাউস রেন্ট: ০ ৳) Tj
0 -15 Td (মেডিকেল এলাউন্স: ০ ৳) Tj
0 -15 Td (ট্রান্সপোর্টেশন: ০ ৳) Tj
0 -15 Td (অন্যান্য ভাতা: ০ ৳) Tj
0 -15 Td (----------------------------------------------) Tj
0 -15 Td (মোট আয়: ${parseInt(empSalary).toLocaleString('en-BD')} ৳) Tj
0 -15 Td (প্রভিডেন্ট ফান্ড: ০ ৳) Tj
0 -15 Td (ট্যাক্স: ০ ৳) Tj
0 -15 Td (অন্যান্য কর্তন: ০ ৳) Tj
0 -15 Td (----------------------------------------------) Tj
0 -15 Td (নিট বেতন: ${parseInt(empSalary).toLocaleString('en-BD')} ৳) Tj
0 -30 Td (===============================================) Tj
0 -30 Tf
/F1 10 Tf
0 -20 Td (এই রিপোর্টটি ${startDateFormatted} থেকে ${endDateFormatted} পর্যন্ত সময়ের জন্য তৈরি করা হয়েছে) Tj
0 -15 Td (রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে এবং ডিজিটালি স্বাক্ষরিত) Tj
0 -15 Td (কোম্পানির অফিসিয়াল ডকুমেন্ট) Tj
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
0000002254 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
2354
%%EOF
`;

        return pdfContent;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            Employee Salary Report
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Employee Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Staff Employee <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                            >
                                <option value="">স্টাফ এমপ্লয়ী নির্বাচন করুন</option>
                                {Array.isArray(employees) && employees.map((employee) => (
                                    <option key={employee._id} value={employee._id}>
                                        {employee.name || employee.employeeName} - {employee.designation || employee.position} ({employee.mobile || employee.phone})
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <p className="text-sm text-gray-500 mt-1">স্টাফ এমপ্লয়ী লোড হচ্ছে...</p>
                            )}
                            
                            {!loading && Array.isArray(employees) && employees.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-1">কোন স্টাফ এমপ্লয়ী পাওয়া যায়নি (শুধু staffType: "staff" দেখানো হচ্ছে)</p>
                            )}
                        </div>

                        {/* Download Button */}
                        <div className="flex justify-center pt-4">
                            <MainButton
                                onClick={handleDownload}
                                disabled={loading || !startDate || !endDate || !selectedEmployee}
                                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !startDate || !endDate || !selectedEmployee
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9] '
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>PDF ডাউনলোড হচ্ছে...</span>
                                    </div>
                                ) : (
                                    'Download Salary Report'
                                )}
                            </MainButton>
                        </div>
                    </div>

                    {/* Selected Employee Preview */}
                    {selectedEmployee && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                নির্বাচিত স্টাফ এমপ্লয়ীর তথ্য
                            </h3>
                            {(() => {
                                const employee = employees.find(e => e._id === selectedEmployee);
                                return employee ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p><span className="font-medium">নাম:</span> {employee.name || employee.employeeName}</p>
                                            <p><span className="font-medium">মোবাইল:</span> {employee.mobile || employee.phone}</p>
                                            <p><span className="font-medium">পদবী:</span> {employee.designation || employee.position}</p>
                                            <p><span className="font-medium">স্টাফ টাইপ:</span> {employee.staffType}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">বেতন:</span> {employee.salary ? parseInt(employee.salary).toLocaleString('en-BD') + ' ৳' : '0 ৳'}</p>
                                            <p><span className="font-medium">সেশন:</span> {employee.session || 'N/A'}</p>
                                            <p><span className="font-medium">স্ট্যাটাস:</span> {employee.status || employee.position}</p>
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
                                শুধুমাত্র স্টাফ এমপ্লয়ীদের (staffType: "staff") স্যালারি তথ্য PDF ফরম্যাটে ডাউনলোড হবে
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSalaryReport;