import { useState } from "react";
import axiosInstance from "../../../../../../../hooks/axiosInstance/axiosInstance";
import MainButton from "../../../../../../sharedItems/Mainbutton/Mainbutton";


const AddNewMainContact = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    upazila: "",
    district: "",
    postOffice: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await axiosInstance.post("/contact-main", formData);
      if (res.data?.success) {
        setMsg("✅ নতুন কন্টাক্ট যোগ হয়েছে!");
        setTimeout(() => onSuccess(), 800);
      } else setMsg("❌ সমস্যা হয়েছে!");
    } catch  {
      setMsg("❌ সার্ভার এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">নতুন কন্টাক্ট যোগ করুন</h2>

      {msg && <p className="text-center text-blue-600 mb-4">{msg}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" placeholder="যোগাযোগ করুন" onChange={handleChange} value={formData.name} className="border p-2 rounded" required />
        <input name="mobile" placeholder="মোবাইল" onChange={handleChange} value={formData.mobile} className="border p-2 rounded" required />
        <input name="email" placeholder="ইমেইল" onChange={handleChange} value={formData.email} className="border p-2 rounded" required />
        <input name="address" placeholder="ঠিকানা" onChange={handleChange} value={formData.address} className="border p-2 rounded" />
        <input name="upazila" placeholder="থানা" onChange={handleChange} value={formData.upazila} className="border p-2 rounded" />
        <input name="district" placeholder="জেলা" onChange={handleChange} value={formData.district} className="border p-2 rounded" />
        <input name="postOffice" placeholder="পোস্ট অফিস" onChange={handleChange} value={formData.postOffice} className="border p-2 rounded" />

        <div className="md:col-span-2 flex justify-between mt-4">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            বাতিল
          </button>
          <MainButton
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-[#1e90c9]"
            }`}
          >
            {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </MainButton>
        </div>
      </form>
    </div>
  );
};

export default AddNewMainContact;
