

import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { useLocation } from "wouter";
import ZostikPOSLogo from "../assets/img/ZostikPOSLogo.png";
import ZostikLogo from "../assets/img/ZostikLogo.png";
import LoginBg from "../assets/img/LoginBg.svg";
import { useRegisterStore } from "../stores/registerStore";

const Register = () => {
  const [, navigate] = useLocation();
  const {
    username,
    email,
    password,
    adminpassword,
    error,
    loading,
    setFormData,
    register,
    reset,
  } = useRegisterStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register();
    if (success) {
      navigate("/login");
      reset();
    }
  };

  return (
    <div className="font-extrabold relative h-full flex items-center justify-center">
      {/* Background Image */}
      <img
        src={LoginBg}
        className="fixed inset-0 w-full h-full object-cover z-0"
        alt="Background"
      />

      <div className="absolute z-10 top-8 left-12 flex items-center">
        <img
          src={ZostikPOSLogo}
          className="w-12 inline-block"
          alt="Zostik POS Logo"
        />
        <span className="ml-4 font-black text-4xl text-gray-700">
          Zostik POS
        </span>
      </div>

      {/* Registration Form */}
      <div
        className="relative z-10 bg-white shadow-lg rounded-xl p-4 w-80"
        style={{ marginLeft: "39%" }}
      >
        <h1 className="text-3xl text-gray-700 text-center mb-6">Register</h1>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 group relative">
            <label
              htmlFor="username"
              className="block text-xs text-gray-600 pb-1"
            >
              Username
            </label>
            <FaUser className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Username"
              required
            />
          </div>

          <div className="mb-4 group relative">
            <label htmlFor="email" className="block text-xs text-gray-600 pb-1">
              Email Address
            </label>
            <FaEnvelope className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Email"
              required
            />
          </div>

          <div className="mb-4 group relative">
            <label
              htmlFor="password"
              className="block text-xs text-gray-600 pb-1"
            >
              Password
            </label>
            <FaLock className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Password"
              required
            />
          </div>

          <div className="mb-6 group relative">
            <label
              htmlFor="adminpassword"
              className="block text-xs text-gray-600 pb-1"
            >
              Admin Password
            </label>
            <FaLock className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
            <input
              type="password"
              id="adminpassword"
              name="adminpassword"
              value={adminpassword}
              onChange={handleChange}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Admin Password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-green-500 hover:bg-green-600 py-2 px-8 rounded-md text-sm focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <div className="flex justify-center items-center mt-4 text-sm text-gray-600">
          <a href="/login" className="underline hover:text-blue-600">
            Already Registered? - Login
          </a>
        </div>
      </div>

      <div className="absolute z-10 bottom-8 left-16 text-md font-bold flex items-center">
        <img src={ZostikLogo} className="w-5 inline-block" alt="Zostik Logo" />
        <a
          href="http://www.zostik.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 mr-8 text-gray-700 hover:text-violet-800"
        >
          www.zostik.com
        </a>
        <FaPhone className="mr-2 text-blue-700" />
        <span>0112-1212121</span>
      </div>
    </div>
  );
};

export default Register;
