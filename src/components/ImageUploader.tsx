// components/ImageUploader.tsx
import { FaTrashAlt } from "react-icons/fa";
import placeholder from "../assets/img/placeholder.jpg";

interface ImageUploaderProps {
  imagePreview: string | null;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  label: string;
}

export function ImageUploader({
  imagePreview,
  handleUpload,
  removeImage,
  label,
}: ImageUploaderProps) {
  return (
    <div className="col-span-1 row-span-3 relative">
      <div className="w-full h-52 bg-gray-200 hover:opacity-80 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center relative hover:bg-gray-50 transition-all duration-200 ease-in-out group">
        <input
          onChange={handleUpload}
          type="file"
          accept="image/*"
          className="opacity-0 absolute inset-0"
          title={`Upload ${label} image`}
        />
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden group-hover:opacity-90 transition-all">
          <img
            src={imagePreview ?? placeholder}
            alt={`Upload ${label} image`}
            className="object-cover w-full h-full"
          />
        </div>

        {!imagePreview && (
          <div className="text-center text-gray-600 group-hover:text-gray-700 transition-all">
            <p className="text-sm">No {label} uploaded</p>
          </div>
        )}

        {imagePreview && (
          <button
            onClick={removeImage}
            type="button"
            className="absolute top-2 right-2 text-red-500 px-2 py-1 rounded-md bg-gray-200 group-hover:text-white group-hover:bg-red-600 transition-all"
            title={`Remove ${label} image`}
          >
            <FaTrashAlt />
          </button>
        )}
      </div>
    </div>
  );
}
