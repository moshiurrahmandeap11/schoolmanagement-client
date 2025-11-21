import { useEffect, useState } from "react";
import axiosInstance from "../../../../../../hooks/axiosInstance/axiosInstance";
import MainButton from "../../../../../sharedItems/Mainbutton/Mainbutton";
import RichTextEditor from "../../../../../sharedItems/RichTextEditor/RichTextEditor";


const InstituteMessage = () => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    teacherId: "",
    teacherName: "",
    designation: "",
    description: "",
    image: null,
    featured: false,
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axiosInstance.get("/teacher-list").then((res) => {
      if (res.data?.success) setTeachers(res.data.data);
    });
  }, []);

  const handleTeacherChange = (e) => {
    const id = e.target.value;
    const selected = teachers.find((t) => t._id === id);
    setFormData({
      ...formData,
      teacherId: id,
      teacherName: selected?.name || "",
      designation: selected?.designation || "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const sendData = new FormData();
      Object.entries(formData).forEach(([key, val]) => sendData.append(key, val));

      const res = await axiosInstance.post("/institute-messages", sendData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setMsg("✅ ইনস্টিটিউট বার্তা সফলভাবে যোগ হয়েছে!");
        setFormData({
          teacherId: "",
          teacherName: "",
          designation: "",
          description: "",
          image: null,
          featured: false,
        });
        setPreview("");
      } else {
        setMsg("❌ কিছু সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ সার্ভার এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto bg-white shadow-md p-6 rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">ইনস্টিটিউট বার্তা যোগ করুন</h2>

      {msg && <p className="mb-4 text-center text-blue-600 font-medium">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Teacher Dropdown */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            শিক্ষকের নাম <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.teacherId}
            onChange={handleTeacherChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-[#1e90c9]"
            required
          >
            <option value="">শিক্ষক নির্বাচন করুন</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} - {t.designation}
              </option>
            ))}
          </select>
        </div>

        {/* Designation */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">পদবি</label>
          <input
            type="text"
            value={formData.designation}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            বিবরণ <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
            placeholder="বিবরণ লিখুন..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">ছবি</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg p-2"
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-20 h-20 mt-2 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Featured */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 text-[#1e90c9] border-gray-300 rounded"
          />
          <label className="ml-2 text-gray-700">Featured</label>
        </div>

        {/* Save Button */}
        <MainButton
          type="submit"
          disabled={loading}
          className={`w-full py-3 flex items-center justify-center rounded-lg text-white font-semibold transition ${
            loading ? "bg-gray-400" : "bg-[#1e90c9]"
          }`}
        >
          {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </MainButton>
      </form>
    </div>
  );
};

export default InstituteMessage;
