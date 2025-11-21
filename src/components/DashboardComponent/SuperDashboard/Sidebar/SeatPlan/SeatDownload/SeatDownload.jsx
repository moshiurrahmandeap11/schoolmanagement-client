import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const SeatDownload = () => {
    const [arrangements, setArrangements] = useState([]);
    const [selectedArrangement, setSelectedArrangement] = useState('');
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    // Fetch seat arrangements
    const fetchArrangements = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/seat-arrangement');
            if (response.data && response.data.success) {
                setArrangements(response.data.data || []);
            }
        } catch (err) {
            setError('আসল পরিকল্পনা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching seat arrangements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArrangements();
    }, []);

    // Handle download PDF
    const handleDownloadPDF = async () => {
        if (!selectedArrangement) {
            Swal.fire({
                icon: 'warning',
                title: 'সতর্কতা!',
                text: 'দয়া করে একটি আসল পরিকল্পনা নির্বাচন করুন',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        setDownloading(true);

        try {
            // Find the selected arrangement
            const arrangement = arrangements.find(arr => arr._id === selectedArrangement);
            
            if (!arrangement) {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: 'পরিকল্পনা পাওয়া যায়নি',
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#d33'
                });
                setDownloading(false);
                return;
            }

            // Show loading
            Swal.fire({
                title: 'PDF তৈরি হচ্ছে...',
                text: 'অনুগ্রহ করে অপেক্ষা করুন',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Dynamic import for jsPDF - handle both default and named export
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

            // Create PDF with A4 size
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('Seat Arrangement Plan', 105, 20, { align: 'center' });
            
            // Add arrangement details
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            
            let yPosition = 40;
            
            // Basic information - Left Column
            doc.text(`Class: ${arrangement.className || 'N/A'}`, 20, yPosition);
            doc.text(`Batch: ${arrangement.batch || 'N/A'}`, 20, yPosition + 8);
            doc.text(`Section: ${arrangement.section || 'N/A'}`, 20, yPosition + 16);
            doc.text(`Session: ${arrangement.activeSession || 'N/A'}`, 20, yPosition + 24);
            
            // Basic information - Right Column
            doc.text(`Exam: ${arrangement.exam || 'N/A'}`, 120, yPosition);
            doc.text(`Duration: ${arrangement.examDuration || 'N/A'}`, 120, yPosition + 8);
            doc.text(`Hall Room: ${arrangement.hallRoom || 'N/A'}`, 120, yPosition + 16);
            doc.text(`Monthly Fee: ${arrangement.monthlyFee || 0} Tk`, 120, yPosition + 24);
            
            yPosition += 40;
            
            // Seat arrangement details
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Seat Arrangement Details', 20, yPosition);
            
            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            yPosition += 10;
            
            doc.text(`Columns: ${arrangement.columnNumber || 0}`, 20, yPosition);
            doc.text(`Rows: ${arrangement.rowNumber || 0}`, 70, yPosition);
            doc.text(`Students/Bench: ${arrangement.studentsPerBench || 0}`, 120, yPosition);
            
            yPosition += 8;
            doc.text(`Total Seats: ${arrangement.totalSeats || 0}`, 20, yPosition);
            
            yPosition += 15;
            
            // Create seat plan table
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(41, 128, 185);
            
            // Table header
            const tableX = 20;
            const colWidths = [20, 20, 20, 35, 35];
            const rowHeight = 8;
            
            doc.rect(tableX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
            doc.text('Row', tableX + 5, yPosition + 5.5);
            doc.text('Col', tableX + colWidths[0] + 5, yPosition + 5.5);
            doc.text('Bench', tableX + colWidths[0] + colWidths[1] + 5, yPosition + 5.5);
            doc.text('Students', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, yPosition + 5.5);
            doc.text('Seat No.', tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, yPosition + 5.5);
            
            yPosition += rowHeight + 2;
            
            // Table rows
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            let seatCounter = 1;
            const rowNumber = parseInt(arrangement.rowNumber) || 0;
            const columnNumber = parseInt(arrangement.columnNumber) || 0;
            const studentsPerBench = parseInt(arrangement.studentsPerBench) || 0;
            
            for (let row = 1; row <= rowNumber; row++) {
                for (let col = 1; col <= columnNumber; col++) {
                    for (let bench = 1; bench <= studentsPerBench; bench++) {
                        // Check if we need a new page
                        if (yPosition > 270) {
                            doc.addPage();
                            yPosition = 20;
                            
                            // Re-add table header on new page
                            doc.setFontSize(10);
                            doc.setTextColor(255, 255, 255);
                            doc.setFillColor(41, 128, 185);
                            doc.rect(tableX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
                            doc.text('Row', tableX + 5, yPosition + 5.5);
                            doc.text('Col', tableX + colWidths[0] + 5, yPosition + 5.5);
                            doc.text('Bench', tableX + colWidths[0] + colWidths[1] + 5, yPosition + 5.5);
                            doc.text('Students', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, yPosition + 5.5);
                            doc.text('Seat No.', tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, yPosition + 5.5);
                            yPosition += rowHeight + 2;
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0);
                        }
                        
                        // Alternate row colors
                        if (seatCounter % 2 === 0) {
                            doc.setFillColor(245, 245, 245);
                            doc.rect(tableX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
                        }
                        
                        // Draw cell borders
                        doc.setDrawColor(200, 200, 200);
                        doc.rect(tableX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight);
                        
                        // Add text
                        doc.text(row.toString(), tableX + 8, yPosition + 5.5);
                        doc.text(col.toString(), tableX + colWidths[0] + 8, yPosition + 5.5);
                        doc.text(bench.toString(), tableX + colWidths[0] + colWidths[1] + 8, yPosition + 5.5);
                        doc.text(studentsPerBench.toString(), tableX + colWidths[0] + colWidths[1] + colWidths[2] + 12, yPosition + 5.5);
                        doc.text(`S-${seatCounter}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 10, yPosition + 5.5);
                        
                        yPosition += rowHeight;
                        seatCounter++;
                    }
                }
            }
            
            // Add footer to all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const footerText = `Page ${i} / ${pageCount} - Downloaded: ${new Date().toLocaleDateString('en-GB')}`;
                doc.text(
                    footerText,
                    105,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }
            
            // Generate filename
            const timestamp = new Date().getTime();
            const fileName = `seat-plan-${arrangement.className}-${arrangement.batch}-${timestamp}.pdf`;
            
            // Save PDF
            doc.save(fileName);
            
            // Close loading and show success
            Swal.fire({
                icon: 'success',
                title: 'সফল!',
                text: 'আসন পরিকল্পনা সফলভাবে ডাউনলোড হয়েছে',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#10b981',
                timer: 3000,
                timerProgressBar: true
            });
            
        } catch (err) {
            console.error('Error generating PDF:', err);
            console.error('Error details:', err.message);
            console.error('Error stack:', err.stack);
            
            // More specific error messages
            let errorTitle = 'ত্রুটি!';
            let errorMessage = 'PDF তৈরি করতে সমস্যা হয়েছে।';
            
            if (err.message && err.message.includes('jsPDF')) {
                errorMessage = 'jsPDF library লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।';
            } else if (err.message && err.message.includes('import')) {
                errorMessage = 'PDF library import করতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।';
            }
            
            Swal.fire({
                icon: 'error',
                title: errorTitle,
                text: errorMessage,
                footer: `<small style="color: #666;">Error: ${err.message}</small>`,
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#d33'
            });
        } finally {
            setDownloading(false);
        }
    };

    // Handle arrangement selection
    const handleArrangementChange = (e) => {
        setSelectedArrangement(e.target.value);
        setError(''); // Clear any previous errors
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold ">
                            আসন পরিকল্পনা ডাউনলোড
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">আসল পরিকল্পনা লোড হচ্ছে...</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Selection Section */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-[#1e90c9] mb-4">
                                        পরিকল্পনা নির্বাচন করুন
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                আসল পরিকল্পনা <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={selectedArrangement}
                                                onChange={handleArrangementChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                            >
                                                <option value="">পরিকল্পনা নির্বাচন করুন</option>
                                                {arrangements.map((arrangement) => (
                                                    <option key={arrangement._id} value={arrangement._id}>
                                                        {arrangement.className} - {arrangement.batch} - {arrangement.section} - {arrangement.exam} ({arrangement.totalSeats} সিট)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedArrangement && (
                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                <h3 className="text-md font-semibold text-gray-800 mb-3">
                                                    নির্বাচিত পরিকল্পনার বিবরণ
                                                </h3>
                                                {(() => {
                                                    const arrangement = arrangements.find(arr => arr._id === selectedArrangement);
                                                    return arrangement ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p><span className="font-medium">ক্লাস:</span> {arrangement.className}</p>
                                                                <p><span className="font-medium">ব্যাচ:</span> {arrangement.batch}</p>
                                                                <p><span className="font-medium">সেকশন:</span> {arrangement.section}</p>
                                                                <p><span className="font-medium">সেশন:</span> {arrangement.activeSession}</p>
                                                            </div>
                                                            <div>
                                                                <p><span className="font-medium">পরীক্ষা:</span> {arrangement.exam}</p>
                                                                <p><span className="font-medium">সময়:</span> {arrangement.examDuration}</p>
                                                                <p><span className="font-medium">হল রুম:</span> {arrangement.hallRoom}</p>
                                                                <p><span className="font-medium">মোট সিট:</span> {arrangement.totalSeats}</p>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <p><span className="font-medium">আসন বিন্যাস:</span> {arrangement.columnNumber} কলাম × {arrangement.rowNumber} সারি × {arrangement.studentsPerBench} ছাত্র/বেঞ্চ</p>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Download Button */}
                                <div className="text-center">
                                    <MainButton
                                        onClick={handleDownloadPDF}
                                        disabled={!selectedArrangement || downloading}
                                        className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto ${
                                            !selectedArrangement || downloading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-[#1e90c9]'
                                        }`}
                                    >
                                        {downloading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>PDF তৈরি হচ্ছে...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <span>Download Seat Plan</span>
                                            </>
                                        )}
                                    </MainButton>
                                    
                                    {!selectedArrangement && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            ডাউনলোড করতে দয়া করে একটি পরিকল্পনা নির্বাচন করুন
                                        </p>
                                    )}
                                </div>

                                {/* Instructions */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="text-md font-semibold text-[#1e90c9] mb-2">
                                        নির্দেশিকা:
                                    </h3>
                                    <ul className="text-sm text-[#1e90c9] space-y-1 list-disc list-inside">
                                        <li>প্রথমে উপরের ড্রপডাউন থেকে আপনার প্রয়োজনীয় পরিকল্পনা নির্বাচন করুন</li>
                                        <li>পরিকল্পনা নির্বাচন করলে এর বিবরণ দেখানো হবে</li>
                                        <li>"Download Seat Plan" বাটনে ক্লিক করে PDF ডাউনলোড করুন</li>
                                        <li>PDF এ সম্পূর্ণ আসন বিন্যাসের ডিটেইলস থাকবে</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && arrangements.length === 0 && (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-900">কোন আসল পরিকল্পনা পাওয়া যায়নি</p>
                                <p className="mt-2 text-gray-600">ডাউনলোড করার জন্য প্রথমে আসল পরিকল্পনা তৈরি করুন</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatDownload;