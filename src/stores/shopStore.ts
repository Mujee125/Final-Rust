import { create } from "zustand";

import { convertFileToBase64 } from "../utils/utils";

import { invoke } from "@tauri-apps/api/core";

export interface ShopSettings {
  name: string;
  description: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  image: string | null; // Base64 encoded image
}

interface ShopStore {
  shop: ShopSettings;
  imageFile: File | null;
  imagePreview: string | null;
  removeShopImage: () => void;
  fetchShopData: () => Promise<void>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saveShop: () => Promise<void>;
  setShop: (shop: Partial<ShopSettings>) => void;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  shop: {
    name: "",
    description: "",
    address: "",
    contact: "",
    email: "",
    website: "",
    image: null,
  },
  imageFile: null,
  imagePreview: null,

  removeShopImage: () => {
    set({
      imageFile: null,
      imagePreview: null,
      shop: { ...get().shop, image: null },
    });
  },

  fetchShopData: async () => {
    try {
     
      const result = await invoke<ShopSettings[]>("get_shop_settings");

      let shopData: ShopSettings | null = null;
      if (Array.isArray(result) && result.length > 0) {
        shopData = result[0];
      } else if (result && typeof result === "object" && !Array.isArray(result)) {
        shopData = result as ShopSettings;
      }

      if (shopData) {
        set({
          shop: shopData,
          imagePreview: shopData.image
            ? `data:image/png;base64,${shopData.image}`
            : null,
        });
      }
   
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
   
  },

  handleFileUpload: (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      set({
        imageFile: file,
        imagePreview: preview,
      });
    }
  },

  saveShop: async () => {
    const { shop, imageFile } = get();
    try {
    

      let imageBase64 = shop.image || null;
      if (imageFile) {
        imageBase64 = await convertFileToBase64(imageFile);
      }
      const shopToSave = {
        ...shop,
        image: imageBase64,
      };
      await invoke("save_shop_settings", { shop: shopToSave });

      const existingShop = await invoke<ShopSettings[]>("get_shop_settings");

      if (existingShop.length > 0) {
        await invoke("save_shop_settings", {
            shop: {
                ...shop,
                image: imageBase64,
            }
        });
      }

      alert("Shop data saved successfully!");
    } catch (error) {
      console.error("Error saving shop data:", error);
    }
  },

  setShop: (shop) => set((state) => ({ shop: { ...state.shop, ...shop } })),
}));

export const initializeShopStore = async () => {
  const store = useShopStore.getState();
  try {
    
    const shopResult = await invoke<ShopSettings[]>(
      "get_shop_settings"
      );
console.log("Shop Result:", shopResult);
    if (shopResult.length > 0) {
      const shopData = shopResult[0];
      store.setShop(shopData);
      if (shopData.image) {
        useShopStore.setState({
          imagePreview: `data:image/png;base64,${shopData.image}`,
        });
      }
    }
  } catch (error) {
    console.error("Error initializing shop store:", error);
  }

};
