import { FaSave } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";

import { ImageUploader } from "./ImageUploader";
import { TextInput } from "./TextInput";




interface ShopSettings {
  name: string;
  description: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  // Add other fields as needed
}

interface ShopSettingsProps {
  shop: ShopSettings;
  imagePreview: string | null;
  setShop: (updates: Partial<ShopSettings>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeShopImage: () => void;
  saveShop: () => void;
}

export function ShopSettings({
  shop,
  imagePreview,
  setShop,
  handleFileUpload,
  removeShopImage,
  saveShop,
}: ShopSettingsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <FaShop className="mr-2 highlight" />
        Shop Settings
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {/* Shop Name */}
        <TextInput
          id="shopName"
          label="Name"
          value={shop.name}
          onChange={(e) => setShop({ name: e.target.value })}
          type="text"
          placeholder="Enter shop name"
          className="col-span-2"
        />
        {/* Shop Description */}
        <TextInput
          id="shopDescription"
          label="Description"
          value={shop.description}
          onChange={(e) => setShop({ description: e.target.value })}
          type="text"
          placeholder="Enter shop description"
          className="col-span-2"
        />
        {/* Shop address */}
        <TextInput
          id="shopAddress"
          label="Address"
          value={shop.address}
          onChange={(e) => setShop({ address: e.target.value })}
          type="text"
          placeholder="Enter shop address"
          className="col-span-2"
        />

        {/* Image Upload Section */}

        <ImageUploader
          imagePreview={imagePreview}
          handleUpload={handleFileUpload}
          removeImage={removeShopImage}
          label="Logo"
        />
        {/* Shop contact */}
        <TextInput
          id="shopContact"
          label="Contact"
          value={shop.contact}
          onChange={(e) => setShop({ contact: e.target.value })}
          type="number"
          placeholder="Enter shop Contact"
        />
        {/* Shop email */}
        <TextInput
          id="shopEmail"
          label="Email"
          value={shop.email}
          onChange={(e) => setShop({ email: e.target.value })}
          type="email"
          placeholder="Enter shop Email"
        />
        {/* Shop website */}
        <TextInput
          id="shopWebsite"
          label="Website"
          value={shop.website}
          onChange={(e) => setShop({ website: e.target.value })}
          type="text"
          placeholder="Enter shop Website"
        />

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
  );
}
