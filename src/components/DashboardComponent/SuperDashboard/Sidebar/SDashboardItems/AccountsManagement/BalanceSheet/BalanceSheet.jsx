import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const BalanceSheet = ({ onBack }) => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalBalance, setTotalBalance] = useState(0);

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/bank-accounts');
            
            if (response.data.success) {
                const accounts = response.data.data || [];
                setBankAccounts(accounts);
                
                // Calculate total balance - শুধু currentBalance ব্যবহার করছি
                const total = accounts.reduce((sum, account) => sum + (account.currentBalance || 0), 0);
                setTotalBalance(total);
            }
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            showSweetAlert('error', 'ব্যাংক একাউন্ট লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
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

    // Export to Excel function
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                bankAccounts.map(account => ({
                    'নাম': account.name,
                    'একাউন্ট নাম্বার': account.accountNumber,
                    'শাখা': account.branchName,
                    'ব্যালেন্স': account.currentBalance || 0
                }))
            );

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Balance Sheet');

            // Set column widths
            const colWidths = [
                { wch: 20 }, // নাম
                { wch: 25 }, // একাউন্ট নাম্বার
                { wch: 20 }, // শাখা
                { wch: 15 }  // ব্যালেন্স
            ];
            worksheet['!cols'] = colWidths;

            XLSX.writeFile(workbook, `Balance_Sheet_${new Date().toISOString().split('T')[0]}.xlsx`);
            showSweetAlert('success', 'এক্সেল ফাইল সফলভাবে ডাউনলোড হয়েছে');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showSweetAlert('error', 'এক্সেল ফাইল ডাউনলোড করতে সমস্যা হয়েছে');
        }
    };

    // Export to PDF function
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('ব্যালেন্স শিট', 105, 15, { align: 'center' });
            
            // Date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`জেনারেটেড: ${new Date().toLocaleDateString('bn-BD')}`, 105, 22, { align: 'center' });
            
            // Total Balance
            doc.setFontSize(12);
            doc.setTextColor(0, 100, 0);
            doc.text(`মোট ব্যালেন্স: ৳${totalBalance.toLocaleString()}`, 105, 30, { align: 'center' });

            // Table
            const tableColumn = ['নাম', 'একাউন্ট নাম্বার', 'শাখা', 'ব্যালেন্স'];
            const tableRows = bankAccounts.map(account => [
                account.name,
                account.accountNumber,
                account.branchName,
                `৳${(account.currentBalance || 0).toLocaleString()}`
            ]);

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 10,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 35, halign: 'right' }
                },
                margin: { top: 35 }
            });

            // Footer
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('স্বয়ংক্রিয়ভাবে জেনারেটেড - School Management System', 105, finalY, { align: 'center' });

            doc.save(`Balance_Sheet_${new Date().toISOString().split('T')[0]}.pdf`);
            showSweetAlert('success', 'পিডিএফ ফাইল সফলভাবে ডাউনলোড হয়েছে');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            showSweetAlert('error', 'পিডিএফ ফাইল ডাউনলোড করতে সমস্যা হয়েছে');
        }
    };

    const formatBalance = (balance) => {
        return `৳${(balance || 0).toLocaleString()}`;
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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                ব্যালেন্স শিট
                            </h1>
                            <p className="text-green-600 font-semibold mt-1">
                                Total Balance: ৳{totalBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToExcel}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            <FaFileExcel className="text-sm" />
                            Export as Excel
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            <FaFilePdf className="text-sm" />
                            Export as PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">ব্যাংক একাউন্ট লোড হচ্ছে...</p>
                        </div>
                    ) : bankAccounts.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">🏦</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন ব্যাংক একাউন্ট পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                ব্যাংক একাউন্ট যোগ করুন
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        ব্যাংক একাউন্ট তালিকা ({bankAccounts.length}টি)
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaDownload className="text-sm" />
                                        <span>মোট ব্যালেন্স: </span>
                                        <span className="font-bold text-green-600">
                                            ৳{totalBalance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                একাউন্ট নাম্বার
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শাখা
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যালেন্স
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {bankAccounts.map((account) => (
                                            <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {account.name}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-800 font-mono">
                                                        {account.accountNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {account.branchName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-semibold text-sm ${
                                                        (account.currentBalance || 0) >= 0 
                                                            ? 'text-green-600' 
                                                            : 'text-red-600'
                                                    }`}>
                                                        {formatBalance(account.currentBalance)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* Footer with total */}
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right font-semibold text-gray-800">
                                                মোট ব্যালেন্স:
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-lg text-green-600">
                                                    ৳{totalBalance.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    {!loading && bankAccounts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">মোট একাউন্ট</p>
                                        <p className="text-2xl font-bold text-gray-800">{bankAccounts.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaFileExcel className="text-2xl text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">মোট ব্যালেন্স</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ৳{totalBalance.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaFilePdf className="text-2xl text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">গড় ব্যালেন্স</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ৳{(totalBalance / bankAccounts.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaDownload className="text-2xl text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;