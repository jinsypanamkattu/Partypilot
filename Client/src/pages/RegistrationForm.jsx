import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, UserPlus, Upload, Lock } from 'lucide-react';
import { addUserThunk } from '../redux/slices/usersSlice';

const RegistrationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: '',
    profileImage: null
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, role, password } = formData;
    if (!name || !email || !phone || !role || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setErrorMsg('');

    dispatch(addUserThunk(formData))
      .unwrap()
      .then(() => {
        setSuccessMessage("Registered successfully! 🎉 Please log in.");
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        console.error("Failed to add user:", error);
        setErrorMsg("Registration Failed. Please try again.");
      });
  };
  const handleForgotPassword = (email) => {
    dispatch(requestPasswordResetThunk({ email }))
      .unwrap()
      .then(() => {
        setSuccessMessage("Password reset link sent to your email.");
      })
      .catch(() => {
        setErrorMsg("Failed to send reset link. Please try again.");
      });
  };


  return (
    <div className="flex items-center justify-center min-h-[70px] bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white shadow-2xl rounded-xl p-8 space-y-6 border border-gray-100"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Register to get started</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center">
              {errorMsg}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-center">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <input 
                  type="file" 
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="profileImage" className="cursor-pointer">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Upload className="text-gray-500" />
                      <span className="sr-only">Upload Profile Image</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-gray-600"
              >
                <option value="">Select Role</option>
                <option value="organizer">Organizer</option>
                <option value="attendee">Attendee</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-[1.02] shadow-md mt-4"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

