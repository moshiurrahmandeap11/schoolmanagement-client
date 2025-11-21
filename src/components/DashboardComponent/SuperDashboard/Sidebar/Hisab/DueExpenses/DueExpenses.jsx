
const DueExpenses = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className=" px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            Due Expenses
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="text-center">
                            {/* Pay Due Expense Text */}
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Pay Due Expense
                            </h2>
                            
                            {/* No Expenses Message */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <svg 
                                        className="w-12 h-12 text-yellow-500" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                    <p className="text-lg font-medium text-yellow-800">
                                        No expenses to pay at this time.
                                    </p>
                                    <p className="text-sm text-yellow-600">
                                        All expenses are currently paid up to date.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DueExpenses;