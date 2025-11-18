import { useEffect, useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Swal from "sweetalert2";
import MainButton from "../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await axiosInstance.get("/contact-info");

      if (response.data.success) {
        setContactInfo(response.data.data);
      } else {
        console.log("Failed to load contact information");
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/contact", formData);

      Swal.fire({
        icon: "success",
        title: "Message Sent 🎉",
        text: "Thanks for reaching out! We'll get back to you soon.",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({
        name: "",
        email: "",
        mobile: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Oops... 😢",
        text: "Something went wrong. Try again!",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  // Function to convert Google Maps share link to embed URL
  const getEmbedUrl = (link) => {
    if (!link) return null;
    
    // If it's already an embed URL, return as is
    if (link.includes('/embed')) {
      return link;
    }
    
    // If it's a Google Maps share link, try to extract coordinates or place ID
    if (link.includes('goo.gl') || link.includes('google.com/maps')) {
      // For now, return a default embed URL or the original link
      // You might need to implement more sophisticated parsing based on your link format
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.789136732854!2d90.39331431543117!3d23.750826894379485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bd552c2b3b%3A0x4e70f117856f0c22!2sBasundhara%20Residential%20Area%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1642165788393!5m2!1sen!2sbd`;
    }
    
    return link;
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">Loading contact information...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className=" mb-4">
            যোগাযোগ করুন
          </h2>
        </div>

        {/* Contact Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Side - Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Message Us
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+8801xxxxxx"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <MainButton
                type="submit"
                className="w-full flex items-center justify-center"
              >
                Send Message
              </MainButton>
            </form>
          </div>

          {/* Left Side - Contact Information */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              যোগাযোগের তথ্য
            </h3>

            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start space-x-4">
                <FaMapMarkerAlt className="w-6 h-6 text-[#1e90c9] mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">লোকেশন</h4>
                  <p className="text-gray-600">
                    {contactInfo?.address || "ঠিকানা লোড হচ্ছে..."}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-start space-x-4">
                <FaPhone className="w-6 h-6 text-[#1e90c9] mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">মোবাইল</h4>
                  <p className="text-gray-600">
                    {contactInfo?.phone1 || "ফোন নম্বর লোড হচ্ছে..."}
                  </p>
                  {contactInfo?.phone2 && (
                    <p className="text-gray-600">{contactInfo.phone2}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <FaEnvelope className="w-6 h-6 text-[#1e90c9] mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">ইমেইল</h4>
                  <p className="text-gray-600">
                    {contactInfo?.email || "ইমেইল লোড হচ্ছে..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">
                আমাদের অবস্থান
              </h4>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                {contactInfo?.googleMapLink ? (
                  <iframe
                    src={getEmbedUrl(contactInfo.googleMapLink)}
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Location"
                  ></iframe>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>🗺️ গুগল ম্যাপ লোড হচ্ছে...</p>
                    <p className="text-sm mt-2">ম্যাপ লিঙ্ক কনফিগার করা হয়নি</p>
                  </div>
                )}
              </div>
              
              {/* Direct link to Google Maps */}
              {contactInfo?.googleMapLink && (
                <div className="mt-4 text-center">
                  <a
                    href={contactInfo.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1e90c9] hover:text-[#1e90c9] text-sm font-medium inline-flex items-center gap-1"
                  >
                    <span>গুগল ম্যাপে দেখুন</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;