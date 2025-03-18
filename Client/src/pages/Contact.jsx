// ContactPage.jsx
import { useState } from 'react';
import userService from '../services/userService';


const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.contactFormSubmit(formData);
      //
      // console.log(response,"resppp");
      setStatus(response.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStatus('Message sent successfully.');
    } catch (error) {
      setStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center mt-10 mb-10 ml-10 gap-8">
      {/* Left Side - Google Map */}
      <div className="w-full md:w-1/2 h-[550px]">
        <iframe
          className="w-full h-full rounded-2xl shadow-lg"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345086163!2d144.95373531590456!3d-37.81627944202195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5dfd11fd81%3A0xe120a87f6df75814!2sFederation%20Square!5e0!3m2!1sen!2sus!4v1633097245524!5m2!1sen!2sus"
          allowFullScreen=""
          loading="lazy"
          title="Google Map"
        ></iframe>
      </div>

      {/* Right Side - Contact Form */}
      <div className="p-6 bg-white rounded-2xl shadow-xl w-full md:w-1/2 animate-slide-in mr-5">
        <h2 className="text-4xl font-bold mb-6 text-center text-purple-700">Contact Admin</h2>
        {status && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{status}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} value={formData.name} className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="text" name="subject" placeholder="Subject" onChange={handleChange} value={formData.subject} className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <textarea name="message" placeholder="Message" onChange={handleChange} value={formData.message} className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows="5"></textarea>
          <button type="submit" className="w-full bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;


