

// import { useState } from "react";
// import { FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
// import { useLocation } from "wouter";
// import LoginBg from "../assets/img/LoginBg.svg";
// import ZostikPOSLogo from "../assets/img/ZostikPOSLogo.png";
// import ZostikLogo from "../assets/img/ZostikLogo.png";
// import { useAuthStore } from "../stores/authStore";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [, navigate] = useLocation();
//   const { login, error } = useAuthStore();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const success = await login(email, password);
//     if (success) {
//       navigate("/cart");
//     }
//   };

//   return (
//     <div className="font-extrabold relative bg-stone-100 h-full flex items-center justify-center  ">
//       {/* Background Image */}
//       <img
//         src={LoginBg}
//         className="fixed inset-0 w-full h-full object-cover z-0"
//         alt="Background"
//       />

//       <div className="absolute z-10 top-8 left-12 flex items-center">
//         <img
//           src={ZostikPOSLogo}
//           className="w-12 inline-block"
//           alt="Zostik POS Logo"
//         />
//         <span className="ml-4 font-black text-4xl text-gray-700">
//           Zostik POS
//         </span>
//       </div>

//       {/* Login Form */}
//       <div
//         className="relative z-10 bg-white shadow-lg rounded-xl p-4 w-80"
//         style={{ marginLeft: "39%" }}
//       >
//         <h1 className="text-3xl text-gray-700 text-center mb-6">LOGIN</h1>

//         {error && (
//           <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4 group relative">
//             <label htmlFor="email" className="block text-xs text-gray-600 pb-1">
//               Email Address
//             </label>
//             <FaEnvelope className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               placeholder="Enter Email"
//               required
//             />
//           </div>

//           <div className="mb-6 group relative">
//             <label
//               htmlFor="password"
//               className="block text-xs text-gray-600 pb-1"
//             >
//               Password
//             </label>
//             <FaLock className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               placeholder="Password"
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full text-white bg-green-500 hover:bg-green-600 py-2 px-8 rounded-md text-sm focus:outline-none"
//           >
//             Login
//           </button>
//         </form>

//         {/* Forgot Password and Sign-Up Links */}
//         <div className="flex justify-center items-center mt-4 text-sm text-gray-600">
//           <a href="/register" className="underline hover:text-blue-600">
//             Create an Account
//           </a>
//         </div>
//       </div>

//       <div className="absolute z-10 bottom-8 left-16 text-md font-bold flex items-center">
//         <img src={ZostikLogo} className="w-5 inline-block" alt="Zostik Logo" />
//         <a
//           href="http://www.zostik.com"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="ml-2 mr-8 text-gray-700 hover:text-violet-800"
//         >
//           www.zostik.com
//         </a>
//         <FaPhone className="mr-2 text-blue-700" />
//         <span>0112-1212121</span>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState } from "react";
import { FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { useLocation } from "wouter";
import LoginBg from "../assets/img/LoginBg.svg";
import ZostikPOSLogo from "../assets/img/ZostikPOSLogo.png";
import ZostikLogo from "../assets/img/ZostikLogo.png";
import { useAuthStore } from "../stores/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { login, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      // Navigate to /settings if first login, otherwise to /cart
      navigate(result.isFirstLogin ? "/settings" : "/cart");
    }
  };

  return (
    <div className="font-extrabold relative bg-stone-100 h-full flex items-center justify-center  ">
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

      {/* Login Form */}
      <div
        className="relative z-10 bg-white shadow-lg rounded-xl p-4 w-80"
        style={{ marginLeft: "39%" }}
      >
        <h1 className="text-3xl text-gray-700 text-center mb-6">LOGIN</h1>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 group relative">
            <label htmlFor="email" className="block text-xs text-gray-600 pb-1">
              Email Address
            </label>
            <FaEnvelope className="absolute right-3 top-9 text-gray-400 group-hover:text-gray-600" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Email"
              required
            />
          </div>

          <div className="mb-6 group relative">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm border-0 bg-green-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white bg-green-500 hover:bg-green-600 py-2 px-8 rounded-md text-sm focus:outline-none"
          >
            Login
          </button>
        </form>

        {/* Forgot Password and Sign-Up Links */}
        <div className="flex justify-center items-center mt-4 text-sm text-gray-600">
          <a href="/register" className="underline hover:text-blue-600">
            Create an Account
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

export default Login;