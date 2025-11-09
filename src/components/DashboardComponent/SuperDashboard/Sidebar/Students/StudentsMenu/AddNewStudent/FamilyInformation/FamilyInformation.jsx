const FamilyInformation = ({ formData, errors, onChange, clearError }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Father's Name */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    পিতার নাম <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.fatherName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="পিতার সম্পূর্ণ নাম"
                />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
            </div>

            {/* Mother's Name */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    মায়ের নাম <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.motherName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="মায়ের সম্পূর্ণ নাম"
                />
                {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
            </div>

            {/* Guardian Name */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Guardian Name
                </label>
                <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="অভিভাবকের নাম"
                />
            </div>

            {/* Guardian Mobile */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Guardian Mobile
                </label>
                <input
                    type="tel"
                    name="guardianMobile"
                    value={formData.guardianMobile}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="অভিভাবকের মোবাইল নম্বর"
                />
            </div>

            {/* Relation */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Relation
                </label>
                <input
                    type="text"
                    name="relation"
                    value={formData.relation}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="সম্পর্ক"
                />
            </div>

            {/* Guardian NID */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    জাতীয় পরিচয়পত্র-পিতা / মাতা / অবিভাবক
                </label>
                <input
                    type="text"
                    name="guardianNid"
                    value={formData.guardianNid}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="জাতীয় পরিচয়পত্র নম্বর"
                />
            </div>
        </div>
    );
};

export default FamilyInformation;