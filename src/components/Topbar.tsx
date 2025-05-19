

import { useEffect, useRef, useState } from "react";
import { FaBars, FaPhoneAlt } from "react-icons/fa";
import ProfileDropdown from "./ProfileDropdown";
import placeholder2 from "../assets/img/placeholder2.jpg";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to handle outside click

  const { user, logout } = useAuthStore();
  const { shop, fetchShopData } = useSettingsStore();
  // Fetch shop data when component mounts
  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="flex justify-between items-center px-4 py-0 bg-stone-200">
      <span className="lg:hidden px-2 py-1 mr-4 rounded-md hover:bg-green-200">
        <FaBars className="text-gray-700" />
      </span>
      <span className="text-lg text-gray-800 mr-8">{shop.name}</span>
      <span className="hidden md:inline">
        <FaPhoneAlt className="mr-2 text-blue-700" />
      </span>
      <span className="text-lg text-blue-700">+{shop.contact}</span>

      <div className="flex space-x-8 ml-auto">
        {user && (
          <div
            ref={dropdownRef}
            className="relative flex flex-row items-center hover:text-green-600"
          >
            <span className="hidden md:inline">{user.username}</span>
            <button
              className="my-2 ml-1"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <img
                src={
                  user.image
                    ? `data:image/jpeg;base64,${user.image}`
                    : placeholder2
                }
                alt="User Profile"
                className="object-cover size-6 rounded-full"
              />
            </button>

            <ProfileDropdown
              isOpen={isDropdownOpen}
              onLogout={handleLogout}
              onClose={() => setIsDropdownOpen(false)} // 🔹 Called from "Account Settings"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;

