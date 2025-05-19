
import { useEffect } from "react";
import placeholder from "../assets/img/placeholder.jpg";
import { FaCogs, FaSave, FaTrashAlt, FaUserCircle } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { useSettingsStore, initializeSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";

export default function Setting() {
  // Initialize store and fetch data on component mount
  useEffect(() => {
    initializeSettingsStore();
  }, []);

  // Get state and actions from the store
  const {
    shop,
    
    imagePreview,
    userImagePreview,
    setShop,
    setUser,
    handleFileUpload,
    handleUserImageUpload,
    removeShopImage,
    removeUserImage,
    saveShop,
    saveUser
  } = useSettingsStore();
 const authUser = useAuthStore((state) => state.user);
  return (
    <div className="settings space-y-4 p-1">
      {/* Settings Header */}
      <h1 className="text-xl font-semibold text-gray-800 flex items-center">
        <FaCogs className="mr-2 highlight" />
        Settings
      </h1>

      {/* Settings Grid for Multiple Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* General Settings Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaShop className="mr-2 highlight" />
            Shop Settings
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label htmlFor="shopName" className="text-xs font-medium">
                Name
              </label>
              <input
                value={shop.name}
                onChange={(e) => setShop({ name: e.target.value })}
                type="text"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop name"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="shopDescription" className="text-xs font-medium">
                Description
              </label>
              <input
                value={shop.description}
                onChange={(e) => setShop({ description: e.target.value })}
                type="text"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop description"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="shopAddress" className="text-xs font-medium">
                Address
              </label>
              <input
                value={shop.address}
                onChange={(e) => setShop({ address: e.target.value })}
                type="text"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop address"
              />
            </div>

            {/* Image Upload Section */}
            <div className="col-span-1 row-span-3 relative">
              <div className="w-full h-52 bg-gray-200 opacity-100 hover:opacity-80 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center relative hover:bg-gray-50 transition-all duration-200 ease-in-out group">
                <input
                  onChange={handleFileUpload}
                  type="file"
                  className="opacity-0 absolute inset-0"
                  title="Upload shop logo"
                  placeholder="Choose a file"
                />
                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden group-hover:opacity-90 transition-all">
                  <img
                    src={imagePreview ? imagePreview : placeholder}
                    alt="Upload Logo"
                    className="object-cover w-full h-full"
                  />
                </div>

                {!imagePreview && (
                  <div
                    id="noImageSelected"
                    className="text-center text-gray-600 group-hover:text-gray-700 transition-all"
                  >
                    <p className="text-sm">No Logo uploaded</p>
                  </div>
                )}

                {imagePreview && (
                  <button
                    onClick={removeShopImage}
                    type="button"
                    className="absolute top-2 right-2 text-red-500 px-2 py-1 rounded-md bg-gray-200 group-hover:text-white group-hover:bg-red-600 transition-all"
                    id="removeShopImage"
                    title="Remove shop image"
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="shopContact" className="text-xs font-medium">
                Contact
              </label>
              <input
                value={shop.contact}
                onChange={(e) => setShop({ contact: e.target.value })}
                type="number"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop Contact"
              />
            </div>
            <div>
              <label htmlFor="shopEmail" className="text-xs font-medium">
                Email
              </label>
              <input
                value={shop.email}
                onChange={(e) => setShop({ email: e.target.value })}
                type="email"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop Email"
              />
            </div>
            <div>
              <label htmlFor="shopWebsite" className="text-xs font-medium">
                Website
              </label>
              <input
                value={shop.website}
                onChange={(e) => setShop({ website: e.target.value })}
                type="text"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop Website"
              />
            </div>
            <div className="col-span-2 flex flex-cols justify-end items-center">
              <button
                onClick={saveShop}
                className="buttons limebtn text-sm flex items-center"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FaUserCircle className="mr-2 highlight" />
            Account Settings
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label htmlFor="email" className="text-xs font-medium">
                Email
              </label>
              <input
                value={authUser?.email || ""}
                onChange={(e) => setUser({ email: e.target.value })}
                type="email"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email Address"
                disabled
              />
            </div>
            {/* Image Upload Section */}
            <div className="col-span-1 row-span-3 relative">
              <div className="w-full h-52 bg-gray-200 opacity-100 hover:opacity-80 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center relative hover:bg-gray-50 transition-all duration-200 ease-in-out group">
                <input
                  onChange={handleUserImageUpload}
                  type="file"
                  accept="image/*"
                  className="opacity-0 absolute inset-0"
                  title="Upload user image"
                  placeholder="Choose a file"
                />
                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden group-hover:opacity-90 transition-all">
                  <img
                    src={userImagePreview ? userImagePreview : placeholder}
                    alt="Upload Image"
                    className="object-cover w-full h-full"
                  />
                </div>

                {!userImagePreview && (
                  <div
                    id="noImageSelected"
                    className="text-center text-gray-600 group-hover:text-gray-700 transition-all"
                  >
                    <p className="text-sm">No Picture uploaded</p>
                  </div>
                )}

                <button
                  onClick={removeUserImage}
                  type="button"
                  className="absolute top-2 right-2 text-red-500 px-2 py-1 rounded-md bg-gray-200 group-hover:text-white group-hover:bg-red-600 transition-all"
                  id="removeUserImage"
                  title="Remove user image"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="oldPassword" className="text-xs font-medium">
                Old Password
              </label>
              <input
                type="password"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter old password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="text-xs font-medium">
                New Password
              </label>
              <input
                type="password"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-xs font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <div className="col-span-2 flex flex-cols justify-end items-center">
              <button
                onClick={saveUser}
                className="buttons limebtn text-sm flex items-center"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}