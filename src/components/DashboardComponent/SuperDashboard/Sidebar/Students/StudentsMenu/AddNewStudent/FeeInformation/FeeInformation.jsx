const FeeInformation = ({ formData, onChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admission Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Admission Fee
                </label>
                <input
                    type="number"
                    name="admissionFee"
                    value={formData.admissionFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Monthly Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Monthly Fee
                </label>
                <input
                    type="number"
                    name="monthlyFee"
                    value={formData.monthlyFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Previous Dues */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Previous Dues
                </label>
                <input
                    type="number"
                    name="previousDues"
                    value={formData.previousDues}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Session Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Session Fee
                </label>
                <input
                    type="number"
                    name="sessionFee"
                    value={formData.sessionFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Boarding Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Boarding Fee
                </label>
                <input
                    type="number"
                    name="boardingFee"
                    value={formData.boardingFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Other Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Other Fee
                </label>
                <input
                    type="number"
                    name="otherFee"
                    value={formData.otherFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Transport Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Transport Fee
                </label>
                <input
                    type="number"
                    name="transportFee"
                    value={formData.transportFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>

            {/* Residence Fee */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Residence Fee
                </label>
                <input
                    type="number"
                    name="residenceFee"
                    value={formData.residenceFee}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                />
            </div>
        </div>
    );
};

export default FeeInformation;