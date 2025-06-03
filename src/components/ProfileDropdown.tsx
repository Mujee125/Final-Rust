
import { FaKey, FaSignOutAlt } from "react-icons/fa";
import placeholder2 from "../assets/img/placeholder2.jpg";
import { Link } from "wouter";
import { useAuthStore } from "../stores/authStore";

interface ProfileDropdownProps {
  isOpen: boolean;
  onLogout: () => void;
  onClose: () => void; // 🔹 New prop
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onLogout,
  onClose,
}) => {
  const authUser = useAuthStore((state) => state.user);
  if (!isOpen || !authUser) return null;

  return (
    <ul className="absolute right-0 top-11 w-52 mt-1 rounded-md shadow-lg z-10 bg-white text-sm text-gray-600 border border-gray-300">
      <li className="flex flex-col justify-center items-center border-b p-4">
        <img
          src={`data:image/jpeg;base64,${authUser.image}` || placeholder2}
          className="size-20 rounded-full mb-2 object-cover"
          alt="User Profile"
        />
        <div className="text-lg font-medium">{authUser.username}</div>
        <div>{authUser.email}</div>
        <div className="text-red-500">Administrator</div>
      </li>

      <li className="hover:bg-gray-100 border-b">
        <Link
          href="/settings"
          className="flex items-center px-4 py-2"
          onClick={onClose} // 🔹 Close dropdown on click
        >
          <FaKey className="mr-2 text-blue-500" />
          Account Settings
        </Link>
      </li>

      <li className="hover:bg-gray-100">
        <Link
          href="/login"
          onClick={onLogout}
          className="flex items-center px-4 py-2"
        >
          <FaSignOutAlt className="mr-2 text-red-500" />
          Log Out
        </Link>
      </li>
    </ul>
  );
};

export default ProfileDropdown;
