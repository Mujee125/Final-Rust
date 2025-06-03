

import { FaCogs } from "react-icons/fa";
import { useAuthStore } from "../stores/authStore";
import { ShopSettings } from "../components/ShopSettings";
import { UserSettings } from "../components/UserSettings";

import { useShopStore } from "../stores/shopStore";
import { useUserStore } from "../stores/userStore";

export default function Setting() {

 

  // Get shop state and actions
  const {
    shop,
    imagePreview,
    setShop,
    handleFileUpload,
    removeShopImage,
    saveShop,
  } = useShopStore();

  // Get user state and actions
  const {
    userImagePreview,
    setUser,
    handleUserImageUpload,
    removeUserImage,
    saveUser,
  } = useUserStore();

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
        <ShopSettings
          shop={shop}
          imagePreview={imagePreview}
          setShop={setShop}
          handleFileUpload={handleFileUpload}
          removeShopImage={removeShopImage}
          saveShop={saveShop}
        />

        <UserSettings
          user={{
            id: authUser?.id ?? 0,
            email: authUser?.email || "",
            username: authUser?.username || "",
            image: authUser?.image || null,
            password: authUser?.password || "",
          }}
          userImagePreview={userImagePreview}
          setUser={setUser}
          handleUserImageUpload={handleUserImageUpload}
          removeUserImage={removeUserImage}
          saveUser={saveUser} // This should be the async function from useUserStore
        />
      </div>
    </div>
  );
}