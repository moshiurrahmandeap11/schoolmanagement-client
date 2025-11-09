const OtherSettings = ({ formData, onChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Admission SMS */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="sendAdmissionSMS"
                    checked={formData.sendAdmissionSMS}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    id="sendAdmissionSMS"
                />
                <label htmlFor="sendAdmissionSMS" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Send Admission SMS
                </label>
            </div>

            {/* Student Serial */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Student Serial
                </label>
                <input
                    type="number"
                    name="studentSerial"
                    value={formData.studentSerial}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="সিরিয়াল নম্বর"
                    min="0"
                />
            </div>

            {/* Send Attendance SMS */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="sendAttendanceSMS"
                    checked={formData.sendAttendanceSMS}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    id="sendAttendanceSMS"
                />
                <label htmlFor="sendAttendanceSMS" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Send attendance sms
                </label>
            </div>
        </div>
    );
};

export default OtherSettings;