import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { convertFileToBase64 } from "../utils/utils";
import { UserSettings } from "../types/type";

type UserSettingsResponse = UserSettings | null; 

interface UserStore {
  user: UserSettings;
  userImageFile: File | null;
  userImagePreview: string | null;
  removeUserImage: () => void;
  handleUserImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saveUser: () => Promise<void>;
  setUser: (user: Partial<UserSettings>) => void;
  fetchUserData: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: {
    username: "",
    email: "",
    image: null,
  },
  userImageFile: null,
  userImagePreview: null,

  removeUserImage: () => {
    set({
      userImageFile: null,
      userImagePreview: null,
      user: { ...get().user, image: null },
    });
  },
  fetchUserData: async () => {
    try {
      const result = await invoke<UserSettings[]>("get_user_settings");

      let userData: UserSettings | null = null;
      if (Array.isArray(result) && result.length > 0) {
        userData = result[0];
      } else if (
        result &&
        typeof result === "object" &&
        !Array.isArray(result)
      ) {
        userData = result as UserSettings;
      }

      if (userData) {
        set({
          user: userData,
          userImagePreview: userData.image
            ? `data:image/png;base64,${userData.image}`
            : null,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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

  //   saveUser: async () => {
  //     const { user, userImageFile } = get();
  //     try {

  //       let imageBase64 = user.image || null;
  //       if (userImageFile) {
  //         imageBase64 = await convertFileToBase64(userImageFile);
  //       }

  //       const existingUser = await invoke<UserSettings[]>("get_user_settings");
  // console.log("Existing user:", existingUser);
  //       if (existingUser.length > 0) {
  //           await invoke("save_user_settings", {
  //             user: {
  //               ...user,
  //               id:existingUser[0].id,
  //               image: imageBase64,
  //             },
  //           });
  //         console.log("after saving data",user.image)
  //       }

  //       alert("User data saved successfully!");
  //     } catch (error) {
  //       console.error("Error saving user data:", error);
  //     }
  //   },

  //   saveUser: async () => {
  //     const { user, userImageFile } = get();
  //     try {
  //       let imageBase64 = user.image || null;
  //       if (userImageFile) {
  //         imageBase64 = await convertFileToBase64(userImageFile);
  //       }

  //       const existingUsers = await invoke<UserSettings[]>("get_user_settings");
  // console.log("Existing user:", existingUsers);
  //       if (existingUsers && existingUsers.length > 0) {
  //         const existingUser = existingUsers[0];
  //         // Use the existing user's ID
  //         await invoke("save_user_settings", {
  //           user: {
  //             ...user,
  //             id: existingUser.id, // Make sure to include the ID
  //             image: imageBase64,
  //           },
  //         });

  //         // Update the local state with the new image
  //         if (imageBase64) {
  //           set({ userImagePreview: `data:image/png;base64,${imageBase64}` });
  //         }

  //         alert("User data saved successfully!");
  //       } else {
  //         alert("No existing user found to update!");
  //       }
  //     } catch (error) {
  //       console.error("Error saving user data:", error);
  //       alert("Failed to save user data");
  //     }
  //   },

  saveUser: async () => {
    const { user, userImageFile } = get();
    try {
      let imageBase64 = user.image || null;
      if (userImageFile) {
        imageBase64 = await convertFileToBase64(userImageFile);
      }

      // Changed to expect Option<UserSettings> instead of UserSettings[]
      const existingUser = await invoke<UserSettingsResponse>(
        "get_user_settings"
      );
      console.log("Existing user:", existingUser);

      if (existingUser) {
        await invoke("save_user_settings", {
          user: {
            ...user,
            id: existingUser.id, // Use the existing user's ID
            image: imageBase64,
          },
        });

        // Update local state
        if (imageBase64) {
          set({ userImagePreview: `data:image/png;base64,${imageBase64}` });
        } else {
          set({ userImagePreview: null });
        }

        // Update the user in state
        set({ user: { ...user, image: imageBase64 } });

        alert("User data saved successfully!");
      } else {
        alert("No existing user found to update!");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save user data");
    }
  },

  // saveUser: async () => {
  //   const { user, userImageFile } = get();
  //   try {
  //     let imageBase64 = user.image || null;
  //     if (userImageFile) {
  //       imageBase64 = await convertFileToBase64(userImageFile);
  //     }

  //     const existingUser = await invoke<UserSettings>(
  //       "get_user_settings"
  //     );
  //     console.log("Existing user:", existingUser);

  //     if (existingUser) {
  //       // Use the existing user's ID
  //       await invoke("save_user_settings", {
  //         user: {
  //           ...user,
  //           id: existingUser.id, // Make sure to include the ID
  //           image: imageBase64,
  //         },
  //       });

  //       // Update the local state with the new image
  //       if (imageBase64) {
  //         set({ userImagePreview: `data:image/png;base64,${imageBase64}` });
  //       }

  //       alert("User data saved successfully!");
  //     } else {
  //       alert("No existing user found to update!");
  //     }
  //   } catch (error) {
  //     console.error("Error saving user data:", error);
  //     alert("Failed to save user data");
  //   }
  // },

  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
}));

export const initializeUserStore = async () => {
  const store = useUserStore.getState();
  try {
    

    const userResult = await invoke<UserSettings[]>("get_user_settings"
    );
    if (userResult.length > 0) {
      store.setUser(userResult[0]);
      if (userResult[0].image) {
        useUserStore.setState({
          userImagePreview: `data:image/png;base64,${userResult[0].image}`,
        });
      }
    }
  } catch (error) {
    console.error("Error initializing user store:", error);
  }
};
