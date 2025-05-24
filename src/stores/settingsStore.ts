

// import { create } from "zustand";
// import Database from "@tauri-apps/plugin-sql";

// // Interfaces
// interface ShopSettings {
//   id?: number;
//   name: string;
//   description?: string;
//   address?: string;
//   contact?: string;
//   email?: string;
//   website?: string;

//   image?: string | null;
// }

// interface UserSettings {
//   id?: number;
//   username: string;
//   email: string;
//   password?: string;
//   image?: string | null;
//   status?: number;
//   person_id?: number;
//   created_at?: string;
//   updated_at?: string;
// }

// // Zustand store interface
// interface SettingsStore {
//   shop: ShopSettings;
//   user: UserSettings;
//   imageFile: File | null;
//   imagePreview: string | null;
//   userImageFile: File | null;
//   userImagePreview: string | null;

//   // Methods
//   removeUserImage: () => void;
//   removeShopImage: () => void;
//   fetchShopData: () => Promise<void>;
//   handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   handleUserImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   saveShop: () => Promise<void>;
//   saveUser: () => Promise<void>;
//   setShop: (shop: Partial<ShopSettings>) => void;
//   setUser: (user: Partial<UserSettings>) => void;
// }

// // Zustand Store
// export const useSettingsStore = create<SettingsStore>((set, get) => ({
//   shop: {
//     name: "",
//     description: "",
//     address: "",
//     contact: "",
//     email: "",
//     website: "",

//     image: null,
//   },
//   user: {
//     username: "",
//     email: "",
//     image: null,
//   },
//   imageFile: null,
//   imagePreview: null,
//   userImageFile: null,
//   userImagePreview: null,

//   removeUserImage: () => {
//     set({
//       userImageFile: null,
//       userImagePreview: null,
//       user: { ...get().user, image: null },
//     });
//   },

//   removeShopImage: () => {
//     set({
//       imageFile: null,
//       imagePreview: null,
//       shop: { ...get().shop, image: null },
//     });
//   },

//   fetchShopData: async () => {
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");
//       const result = await db.select<ShopSettings[]>(
//         "SELECT * FROM shop LIMIT 1"
//       );

//       if (result.length > 0) {
//         const shopData = result[0];
//         set({
//           shop: shopData,
//           imagePreview: shopData.image
//             ? `data:image/png;base64,${shopData.image}`
//             : null,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching shop data:", error);
//     }
//   },

//   handleFileUpload: (event) => {
//     if (event.target.files && event.target.files[0]) {
//       const file = event.target.files[0];
//       const preview = URL.createObjectURL(file);
//       set({
//         imageFile: file,
//         imagePreview: preview,
//       });
//     }
//   },

//   handleUserImageUpload: (event) => {
//     if (event.target.files && event.target.files[0]) {
//       const file = event.target.files[0];
//       const preview = URL.createObjectURL(file);
//       set({
//         userImageFile: file,
//         userImagePreview: preview,
//       });
//     }
//   },

//   saveShop: async () => {
//     const { shop, imageFile } = get();
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");

//       let imageBase64 = shop.image || null;
//       if (imageFile) {
//         imageBase64 = await convertFileToBase64(imageFile);
//       }

//       const existingShop = await db.select<ShopSettings[]>(
//         "SELECT id FROM shop LIMIT 1"
//       );

//       if (existingShop.length > 0) {
//         await db.execute(
//           `UPDATE shop SET
//             name = $1,
//             description = $2,
//             address = $3,
//             contact = $4,
//             email = $5,
//             website = $6,
           
//             image = $7
//           WHERE id = $8`,
//           [
//             shop.name,
//             shop.description || "",
//             shop.address || "",
//             shop.contact || "",
//             shop.email || "",
//             shop.website || "",

//             imageBase64,
//             existingShop[0].id,
//           ]
//         );
//       } else {
//         await db.execute(
//           `INSERT INTO shop (
//             name, description, address, contact, email, website, image
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//           [
//             shop.name,
//             shop.description || "",
//             shop.address || "",
//             shop.contact || "",
//             shop.email || "",
//             shop.website || "",

//             imageBase64,
//           ]
//         );
//       }

//       alert("Shop data saved successfully!");
//     } catch (error) {
//       console.error("Error saving shop data:", error);
//     }
//   },

//   saveUser: async () => {
//     const { user, userImageFile } = get();
//     try {
//       const db = await Database.load("sqlite:learn_pos.db");

//       let imageBase64 = user.image || null;
//       if (userImageFile) {
//         imageBase64 = await convertFileToBase64(userImageFile);
//       }

//       const existingUser = await db.select<UserSettings[]>(
//         "SELECT id FROM users WHERE id = $1",
//         [user.id || 0]
//       );

//       if (existingUser.length > 0) {
//         await db.execute(
//           `UPDATE users SET
//             username = $1,
//             email = $2,
//             image = $3
//           WHERE id = $4`,
//           [user.username, user.email, imageBase64, user.id]
//         );
//       } else {
//         await db.execute(
//           `INSERT INTO users (
//             username, email, image
//           ) VALUES ($1, $2, $3)`,
//           [user.username, user.email, imageBase64]
//         );
//       }

//       alert("User data saved successfully!");
//     } catch (error) {
//       console.error("Error saving user data:", error);
//     }
//    },

//   setShop: (shop) => set((state) => ({ shop: { ...state.shop, ...shop } })),
//   setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
// }));

// // Helper to convert file to base64
// async function convertFileToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       const result = reader.result as string;
//       const base64String = result.replace(/^data:.+;base64,/, "");
//       resolve(base64String);
//     };
//     reader.onerror = (error) => reject(error);
//   });
// }

// // Initializer function
// export const initializeSettingsStore = async () => {
//   const store = useSettingsStore.getState();

//   try {
//     const db = await Database.load("sqlite:learn_pos.db");

//     const shopResult = await db.select<ShopSettings[]>(
//       "SELECT * FROM shop LIMIT 1"
//     );
//     if (shopResult.length > 0) {
//       const shopData = shopResult[0];
//       store.setShop(shopData);
//       if (shopData.image) {
//         store.setShop({});
//         useSettingsStore.setState({
//           imagePreview: `data:image/png;base64,${shopData.image}`,
//         });
//       }
//     }

//     const userResult = await db.select<UserSettings[]>(
//       "SELECT * FROM users LIMIT 1"
//     );
//     if (userResult.length > 0) {
//       store.setUser(userResult[0]);
//     }
//   } catch (error) {
//     console.error("Error initializing settings store:", error);
//   }
// };

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface ShopSettings {
  id?: number;
  name: string;
  description?: string;
  address?: string;
  contact?: string;
  email?: string;
  website?: string;
  image?: string | null;
}

interface UserSettings {
  id?: number;
  username: string;
  email: string;
  password?: string;
  image?: string ;
  status?: number;
  person_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface SettingsStore {
  shop: ShopSettings;
  user: UserSettings;
  imageFile: File | null;
  imagePreview: string | null;
  userImageFile: File | null;
  userImagePreview: string | null;

  // Methods
  removeUserImage: () => void;
  removeShopImage: () => void;
  fetchShopData: () => Promise<void>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUserImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saveShop: () => Promise<void>;
  saveUser: () => Promise<void>;
  setShop: (shop: Partial<ShopSettings>) => void;
  setUser: (user: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  shop: {
    name: "",
    description: "",
    address: "",
    contact: "",
    email: "",
    website: "",
    image: "",
  },
  user: {
    username: "",
    email: "",
    image: "",
  },
  imageFile: null,
  imagePreview: null,
  userImageFile: null,
  userImagePreview: null,

  removeUserImage: () => {
    set({
      userImageFile: null,
      userImagePreview: null,
      user: { ...get().user, image: "" },
    });
  },

  removeShopImage: () => {
    set({
      imageFile: null,
      imagePreview: null,
      shop: { ...get().shop, image: null },
    });
  },

  fetchShopData: async () => {
    try {
      const shopData = await invoke<ShopSettings | null>("get_shop_settings");
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

  handleUserImageUpload: (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      set({
        userImageFile: file,
        userImagePreview: preview,
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
      alert("Shop data saved successfully!");
    } catch (error) {
      console.error("Error saving shop data:", error);
    }
  },

  saveUser: async () => {
    const { user, userImageFile } = get();
    try {
      let imageBase64 = user.image || null;
      if (userImageFile) {
        imageBase64 = await convertFileToBase64(userImageFile);
      }

      const userToSave = {
        ...user,
        image: imageBase64,
      };

      await invoke("save_user_settings", { user: userToSave });
      alert("User data saved successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  setShop: (shop) => set((state) => ({ shop: { ...state.shop, ...shop } })),
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
}));

// Helper to convert file to base64
async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.replace(/^data:.+;base64,/, "");
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Initializer function
export const initializeSettingsStore = async () => {
  const store = useSettingsStore.getState();

  try {
    await invoke("initialize_settings");

    const shopData = await invoke<ShopSettings | null>(
      "get_current_shop_settings"
    );
    if (shopData) {
      store.setShop(shopData);
      if (shopData.image) {
        useSettingsStore.setState({
          imagePreview: `data:image/png;base64,${shopData.image}`,
        });
      }
    }

    const userData = await invoke<UserSettings | null>(
      "get_current_user_settings"
    );
    if (userData) {
      store.setUser(userData);
    }
  } catch (error) {
    console.error("Error initializing settings store:", error);
  }
};