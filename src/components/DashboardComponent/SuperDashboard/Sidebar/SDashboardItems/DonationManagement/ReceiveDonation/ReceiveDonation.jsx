import { useEffect, useState } from 'react';
import { FaCopy, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import NewReceived from './NewReceived/NewReceived';

const ReceiveDonation = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/donation/received-donations');
      if (res.data.success) {
        setDonations(res.data.data);
      }
    } catch {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'দানের তালিকা লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id, donorName, amount) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `
        <div class="text-center space-y-3">
          <p class="text-lg font-semibold">এই দান মুছে ফেলবেন?</p>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>দাতা:</strong> ${donorName}</p>
            <p><strong>পরিমাণ:</strong> ৳${amount}</p>
            <p class="text-red-500 text-xs">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'bangla-font',
        title: 'bangla-font',
        htmlContainer: 'bangla-font',
        confirmButton: 'bangla-font',
        cancelButton: 'bangla-font'
      }
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/donation/received-donations/${id}`);
        setDonations(donations.filter(d => d._id !== id));
        
        Swal.fire({
          title: 'মুছে ফেলা হয়েছে!',
          html: `
            <div class="text-center space-y-3">
              <p class="text-lg font-semibold">দান সফলভাবে মুছে ফেলা হয়েছে</p>
              <div class="text-sm text-gray-600">
                <p><strong>দাতা:</strong> ${donorName}</p>
                <p><strong>পরিমাণ:</strong> ৳${amount}</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
          customClass: {
            popup: 'bangla-font',
            title: 'bangla-font',
            htmlContainer: 'bangla-font',
            confirmButton: 'bangla-font'
          }
        });
      } catch {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'মুছে ফেলতে সমস্যা হয়েছে',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
          customClass: {
            popup: 'bangla-font',
            title: 'bangla-font',
            htmlContainer: 'bangla-font',
            confirmButton: 'bangla-font'
          }
        });
      }
    }
  };

  const copyNumber = (num) => {
    navigator.clipboard.writeText(num);
    Swal.fire({
      title: 'কপি হয়েছে!',
      html: `
        <div class="text-center space-y-3">
          <div class="text-4xl text-blue-500">📋</div>
          <p class="font-mono text-lg font-semibold">${num}</p>
          <p class="text-sm text-gray-600">নম্বর ক্লিপবোর্ডে কপি হয়েছে</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#2563eb',
      timer: 1500,
      timerProgressBar: true,
      customClass: {
        popup: 'bangla-font',
        title: 'bangla-font',
        htmlContainer: 'bangla-font',
        confirmButton: 'bangla-font'
      }
    });
  };

  if (showNew) {
    return <NewReceived onBack={() => { setShowNew(false); fetchDonations(); }} />;
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">গৃহীত দানের তালিকা</h2>
            <p className="text-gray-600 mt-1">মোট: <strong className="text-[#1e90c9]">{donations.length}</strong> টি</p>
          </div>
          <MainButton
            onClick={() => setShowNew(true)}
          >
            <FaPlus /> নতুন দান
          </MainButton>
        </div>

        {/* Table */}
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">💰</div>
            <p className="text-gray-500">কোনো দান গৃহীত হয়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">দাতার নাম</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">একাউন্ট নম্বর</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরিমাণ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">তারিখ</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr key={d._id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.donorName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{d.accountNumber}</span>
                        <button 
                          onClick={() => copyNumber(d.accountNumber)}
                          className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                          title="কপি করুন"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{d.amount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(d.receivedAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(d._id, d.donorName, d.amount)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="ডিলিট"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SweetAlert2 Bangla Font Support */}
      <style jsx>{`
        .bangla-font {
          font-family: 'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', Arial, sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default ReceiveDonation;