const AddressInformation = ({ formData, errors, onChange, clearError }) => {
    return (
        <div className="space-y-6">
            {/* Permanent Address */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">স্থায়ী ঠিকানা</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                            Village <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="permanentVillage"
                            value={formData.permanentVillage}
                            onChange={onChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                errors.permanentVillage ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="গ্রাম"
                        />
                        {errors.permanentVillage && (
                            <p className="text-red-500 text-xs mt-1">{errors.permanentVillage}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                            Post Office <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="permanentPostOffice"
                            value={formData.permanentPostOffice}
                            onChange={onChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors ${
                                errors.permanentPostOffice ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="ডাকঘর"
                        />
                        {errors.permanentPostOffice && (
                            <p className="text-red-500 text-xs mt-1">{errors.permanentPostOffice}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                            Permanent District
                        </label>
                        <input
                            type="text"
                            name="permanentDistrict"
                            value={formData.permanentDistrict}
                            onChange={onChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            placeholder="জেলা"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                            Permanent Thana
                        </label>
                        <input
                            type="text"
                            name="permanentThana"
                            value={formData.permanentThana}
                            onChange={onChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            placeholder="থানা"
                        />
                    </div>
                </div>
            </div>

            {/* Same as Permanent Checkbox */}
            <div>
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name="sameAsPermanent"
                        checked={formData.sameAsPermanent}
                        onChange={onChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                        বর্তমান ঠিকানা স্থায়ী ঠিকানার মতো একই
                    </span>
                </label>
            </div>

            {/* Current Address */}
            {!formData.sameAsPermanent && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">বর্তমান ঠিকানা</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Village
                            </label>
                            <input
                                type="text"
                                name="currentVillage"
                                value={formData.currentVillage}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                placeholder="গ্রাম"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Post Office
                            </label>
                            <input
                                type="text"
                                name="currentPostOffice"
                                value={formData.currentPostOffice}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                placeholder="ডাকঘর"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Current District
                            </label>
                            <input
                                type="text"
                                name="currentDistrict"
                                value={formData.currentDistrict}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                placeholder="জেলা"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                Current Thana
                            </label>
                            <input
                                type="text"
                                name="currentThana"
                                value={formData.currentThana}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                placeholder="থানা"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressInformation;