import { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

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


  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Any questions? Just drop your message 👇
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+8801xxxxxx"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default Contact;
