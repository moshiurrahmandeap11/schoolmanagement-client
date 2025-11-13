import { useState } from "react";
import axiosInstance from "../../../../../../hooks/axiosInstance/axiosInstance";
import RichTextEditor from "../../../../../sharedItems/RichTextEditor/RichTextEditor";


const AddNewServices = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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
      sendData.append("name", formData.name);
      sendData.append("description", formData.description);
      if (formData.image) sendData.append("image", formData.image);

      const res = await axiosInstance.post("/institute-services", sendData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setMsg("✅ নতুন সুবিধা যুক্ত হয়েছে!");
        setTimeout(() => onSuccess(), 1000);
      } else {
        setMsg("❌ সমস্যা হয়েছে!");
      }
    } catch  {
      setMsg("❌ সার্ভার এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">নতুন সুবিধা যোগ করুন</h2>

      {msg && <p className="text-center text-blue-600 mb-4">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">শিরোনাম</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="সুবিধার নাম লিখুন"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">ছবি</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 mt-2 rounded object-cover"
            />
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">বিবরণ</label>
          <RichTextEditor
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
            placeholder="বিবরণ লিখুন..."
          />
        </div>

        <div className="flex justify-between pt-3">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewServices;
