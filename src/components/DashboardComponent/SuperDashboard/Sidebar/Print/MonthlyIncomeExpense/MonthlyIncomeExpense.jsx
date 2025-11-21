import { useEffect } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';

const MonthlyIncomeExpense = () => {
    useEffect(() => {
        const autoDownloadPDF = async () => {
            try {
                const response = await axiosInstance.get('/bank-accounts', {
                    responseType: 'blob'
                });

                // Create blob and download
                const blob = new Blob([response.data], { 
                    type: 'application/pdf' 
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const fileName = `monthly_income_expense_${new Date().toISOString().split('T')[0]}.pdf`;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error('PDF ডাউনলোড করতে সমস্যা হয়েছে:', error);
                
                // Fallback: যদি API থেকে PDF না আসে, তাহলে একটি সাধারণ PDF তৈরি করে দেবে
                const fallbackText = 'ব্যাংক একাউন্ট তথ্য\n\nদুঃখিত, ডেটা লোড করতে সমস্যা হয়েছে।';
                const blob = new Blob([fallbackText], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `monthly_income_expense_fallback_${new Date().toISOString().split('T')[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        };

        autoDownloadPDF();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Loading Animation */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader />
                        
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                PDF ডাউনলোড হচ্ছে...
                            </h2>
                            <p className="text-gray-600 text-sm">
                                মাসিক আয়-ব্যয়ের রিপোর্ট স্বয়ংক্রিয়ভাবে ডাউনলোড হবে
                            </p>
                        </div>
                    </div>

                    {/* Fallback Message */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            যদি ডাউনলোড শুরু না হয়, তাহলে ব্রাউজারের পপ-আপ ব্লকার চেক করুন অথবা পৃষ্ঠাটি রিফ্রেশ করুন।
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyIncomeExpense;