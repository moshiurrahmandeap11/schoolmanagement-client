import { useEffect, useState } from "react";
import axiosInstance from "../../../../../../hooks/axiosInstance/axiosInstance";
import MainButton from "../../../../../sharedItems/Mainbutton/Mainbutton";
import AddNewMainContact from "./AddNewMainContact/AddNewMainContact";


const ContactMain = () => {
  const [contacts, setContacts] = useState([]);
  const [addMode, setAddMode] = useState(false);

  const fetchContacts = async () => {
    const res = await axiosInstance.get("/contact-main");
    if (res.data?.success) setContacts(res.data.data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("আপনি কি ডিলিট করতে চান?")) return;
    await axiosInstance.delete(`/contact-main/${id}`);
    fetchContacts();
  };

  if (addMode) return <AddNewMainContact onSuccess={() => { setAddMode(false); fetchContacts(); }} />;

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">যোগাযোগের তথ্য</h2>
        <MainButton
          onClick={() => setAddMode(true)}
        >
          নতুন কন্টাক্ট
        </MainButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">যোগাযোগ করুন</th>
              <th className="p-3 border">মোবাইল</th>
              <th className="p-3 border">ইমেইল</th>
              <th className="p-3 border">থানা / জেলা</th>
              <th className="p-3 border">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length ? (
              contacts.map((c) => (
                <tr key={c._id} className="text-center border-b hover:bg-gray-50">
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">{c.mobile}</td>
                  <td className="p-2 border">{c.email}</td>
                  <td className="p-2 border">{c.upazila} / {c.district}</td>
                  <td className="p-2 border space-x-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-gray-500 text-center">
                  কোনো তথ্য পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactMain;
