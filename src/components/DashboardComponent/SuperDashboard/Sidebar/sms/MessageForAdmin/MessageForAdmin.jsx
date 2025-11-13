
const MessageForAdmin = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="bg-white shadow-md rounded-2xl p-6 text-center max-w-md">
                <p className="text-lg font-semibold text-red-600">
                    আপনার SMS API এনাবল করা নেই।
                </p>
                <p className="text-gray-700 mt-2">
                    দয়া করে আপনার ওয়েবসাইট প্রভাইডারের সাথে যোগাযোগ করুন SMS API ক্রয় করার জন্য।
                </p>
            </div>
        </div>
    );
};

export default MessageForAdmin;
