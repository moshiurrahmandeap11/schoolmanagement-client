import { FaUpload } from 'react-icons/fa';

const PersonalInformation = ({ 
    formData, 
    errors, 
    photoPreview, 
    onChange, 
    onPhotoChange, 
    clearError,
    showSweetAlert 
}) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const attachmentTypes = ['ক্যাডেট শাখা', 'অন্যান্য শাখা'];

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showSweetAlert('error', 'ছবির সাইজ 5MB এর বেশি হতে পারবে না');
            e.target.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showSweetAlert('error', 'শুধুমাত্র ছবি ফাইল আপলোড করা যাবে');
            e.target.value = '';
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            onPhotoChange(file, event.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    শিক্ষার্থীর আইডি
                </label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-50"
                    placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
                    disabled
                />
            </div>

            {/* Dakhela Number */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Dakhela Number
                </label>
                <input
                    type="text"
                    name="dakhelaNumber"
                    value={formData.dakhelaNumber}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="দাখেলা নম্বর"
                />
            </div>

            {/* Smart ID Card */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Smart ID Card
                </label>
                <input
                    type="text"
                    name="smartId"
                    value={formData.smartId}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="স্মার্ট আইডি কার্ড নম্বর"
                />
            </div>

            {/* Name */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    নাম <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="শিক্ষার্থীর সম্পূর্ণ নাম"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    জন্ম তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.dob ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Birth Registration */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    জন্ম নিবন্ধন নং
                </label>
                <input
                    type="text"
                    name="birthRegistration"
                    value={formData.birthRegistration}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="জন্ম নিবন্ধন নম্বর"
                />
            </div>

            {/* Gender */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* Mobile */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    মোবাইল
                </label>
                <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="মোবাইল নম্বর"
                />
            </div>

            {/* Blood Group */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Blood Group
                </label>
                <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </select>
            </div>

            {/* Attachments */}
            <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Attachments
                </label>
                <select
                    name="attachmentType"
                    value={formData.attachmentType}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <option value="">Select Attachment Type</option>
                    {attachmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                        type="file"
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                        id="photo"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                        <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-2">
                            {formData.photo ? `Selected: ${formData.photo.name}` : 'ছবি নির্বাচন করুন'}
                        </p>
                        <p className="text-gray-400 text-sm">
                            সর্বোচ্চ সাইজ: 5MB
                        </p>
                    </label>
                </div>
                {photoPreview && (
                    <div className="mt-4 text-center">
                        <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-32 h-32 rounded-lg object-cover mx-auto border-2 border-gray-200 shadow-sm" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalInformation;