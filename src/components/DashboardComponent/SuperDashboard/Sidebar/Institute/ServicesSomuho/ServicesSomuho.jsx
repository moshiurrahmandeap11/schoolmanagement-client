import { useEffect, useState } from "react";

import axiosInstance from "../../../../../../hooks/axiosInstance/axiosInstance";
import AddNewServices from "./AddNewServices";

const ServicesSomuho = () => {
  const [services, setServices] = useState([]);
  const [addMode, setAddMode] = useState(false);

  const fetchServices = async () => {
    const res = await axiosInstance.get("/institute-services");
    if (res.data?.success) setServices(res.data.data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("আপনি কি এই সুবিধাটি ডিলিট করতে চান?")) return;
    await axiosInstance.delete(`/institute-services/${id}`);
    fetchServices();
  };

  if (addMode)
    return (
      <AddNewServices
        onSuccess={() => {
          setAddMode(false);
          fetchServices();
        }}
      />
    );

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">সুবিধাসমূহ</h2>
        <button
          onClick={() => setAddMode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          নতুন সুবিধা
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">শিরোনাম</th>
              <th className="p-3 border">বিবরণ</th>
              <th className="p-3 border">ছবি</th>
              <th className="p-3 border">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {services.length ? (
              services.map((s) => (
                <tr key={s._id} className="text-center border-b hover:bg-gray-50">
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          s.description.length > 80
                            ? s.description.slice(0, 80) + "..."
                            : s.description,
                      }}
                    />
                  </td>
                  <td className="p-2 border">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt="service"
                        className="w-12 h-12 rounded object-cover mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  কোনো সুবিধা পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesSomuho;
