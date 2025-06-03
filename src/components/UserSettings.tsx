// import { FaUserCircle, FaSave } from "react-icons/fa";

// import { ImageUploader } from "./ImageUploader";
// import { TextInput } from "./TextInput";
// import type { UserSettings } from "../types/type";


// interface UserSettingsProps {
//   user: UserSettings;
//   userImagePreview: string | null;
//   setUser: (updates: Partial<UserSettings>) => void;
//   handleUserImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   removeUserImage: () => void;
//   saveUser: () => void;
// }

// export function UserSettings({
//   user,
//   userImagePreview,
//   setUser,
//   handleUserImageUpload,
//   removeUserImage,
//   saveUser,
// }: UserSettingsProps) {
//   return (
//     <div className="bg-white p-4 rounded-lg shadow">
//       <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
//         <FaUserCircle className="mr-2 highlight" />
//         Account Settings
//       </h2>
//       <div className="grid grid-cols-2 gap-2">
//               <TextInput
//                   id="userEmail"
//           label="Email"
//           value={user.email}
//           onChange={(e) => setUser({ email: e.target.value })}
//           type="email"
//           placeholder="Email Address"
//           disabled
//           className="col-span-2"
//         />

//         {/* Image Upload Section */}
//         <ImageUploader
//           imagePreview={userImagePreview}
//           handleUpload={handleUserImageUpload}
//           removeImage={removeUserImage}
//           label="Picture"
//         />

//         <TextInput
//           label="Old Password"
//           type="password"
//           placeholder="Enter old password"
//         />
//         <TextInput
//           label="New Password"
//           type="password"
//           placeholder="Enter new password"
//         />
//         <TextInput
//           label="Confirm Password"
//           type="password"
//           placeholder="Confirm new password"
//         />
      
//         <div className="col-span-2 flex flex-cols justify-end items-center">
//           <button
//             onClick={saveUser}
//             className="buttons limebtn text-sm flex items-center"
//           >
//             <FaSave className="mr-2" />
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { FaUserCircle, FaSave } from "react-icons/fa";
import { ImageUploader } from "./ImageUploader";
import { TextInput } from "./TextInput";

import { useState } from "react";

import type { User as UserSettingsType } from "../types/type";


interface UserSettingsProps {
  user: UserSettingsType;
  userImagePreview: string | null;
  setUser: (updates: Partial<UserSettingsType>) => void;
  handleUserImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeUserImage: () => void;
  saveUser: () => Promise<void>; // Changed to Promise<void>
}


export function UserSettings({
  user,
  userImagePreview,
  setUser,
  handleUserImageUpload,
  removeUserImage,
  saveUser,
}: UserSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await saveUser();
      // Optional: Add success feedback here
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save user settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <FaUserCircle className="mr-2 highlight" />
        Account Settings
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <TextInput
          id="userEmail"
          label="Email"
          value={user.email}
          onChange={(e) => setUser({ email: e.target.value })}
          type="email"
          placeholder="Email Address"
          disabled
          className="col-span-2"
        />

        {/* Image Upload Section */}
        <ImageUploader
          imagePreview={userImagePreview}
          handleUpload={handleUserImageUpload}
          removeImage={removeUserImage}
          label="Picture"
        />

        <TextInput
          label="Old Password"
          type="password"
          placeholder="Enter old password"
        />
        <TextInput
          label="New Password"
          type="password"
          placeholder="Enter new password"
        />
        <TextInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
        />

        <div className="col-span-2 flex flex-cols justify-end items-center">
          {error && <div className="text-red-500 text-sm mr-2">{error}</div>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`buttons limebtn text-sm flex items-center ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}