
import React, { useState, useEffect, useRef } from "react";
import { useDropdownStore } from "../stores/dropdownStore";
import { FaEdit, FaTimes, FaSave, FaPlus } from "react-icons/fa";

interface ExtendableDropdownProps {
  label: string;
  placeholder: string;
  tableName: string; 
  value: string;
  onChange: (value: string) => void;
}

const ExtendableDropdown: React.FC<ExtendableDropdownProps> = ({
  label,
  placeholder,
  tableName, 
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { values, loading, error, fetchData, addItem, updateItem, deleteItem } = 
        useDropdownStore();
    
    const options = values[tableName] || []; 
    
  useEffect(() => {
    fetchData(tableName);
  }, [tableName, fetchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  const handleEdit = (item: { id: number; name: string }) => {
    setInputValue(item.name);
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteItem(tableName, id);
    if (!success) {
      console.error("Failed to delete item");
    }
  };

  const handleAddNew = async () => {
    if (inputValue.trim()) {
      const newId = await addItem(tableName, inputValue);
      if (newId) {
        setInputValue("");
      }
    }
  };

  const handleSave = async () => {
    if (inputValue.trim() && editingId !== null) {
      const success = await updateItem(tableName, editingId, inputValue);
      if (success) {
        setInputValue("");
        setEditingId(null);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="dropdown-input" className="block text-xs font-medium">
        {label}
      </label>
      <input
        id="dropdown-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => setOpen(!open)}
        className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        disabled={loading}
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute w-full bg-white shadow-xl mt-1 border-light rounded-md max-h-96 overflow-y-auto z-10">
          {options.map((item) => (
            <li
              key={item.id}
              className="px-4 py-1 border-light cursor-pointer flex flex-cols gap-2 justify-between items-center hover:bg-gray-100 group"
            >
              <span
                onClick={() => handleOptionClick(item.name)}
                className="flex-grow"
              >
                {item.name}
              </span>
              <span className="flex items-center">
                <FaEdit
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  className="text-transparent group-hover:text-blue-500 cursor-pointer ml-2"
                  size={14}
                  title="Edit"
                />
                <FaTimes
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="text-transparent group-hover:text-red-500 cursor-pointer ml-2"
                  size={14}
                  title="Delete"
                />
              </span>
            </li>
          ))}

          {/* Add new item */}
          <li className="px-2 py-2 border-light cursor-pointer flex flex-cols gap-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add New..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  editingId !== null ? handleSave() : handleAddNew();
                }
              }}
            />
            {editingId !== null ? (
              <button
                title="Save"
                onClick={handleSave}
                className="buttons px-2 bg-blue-500 hover:bg-blue-600 text-white text-center text-sm flex items-center justify-center"
                disabled={!inputValue.trim()}
              >
                <FaSave size={14} />
              </button>
            ) : (
              <button
                title="Add"
                onClick={handleAddNew}
                className="buttons px-2 bg-green-600 hover:bg-green-700 text-white text-center text-sm flex items-center justify-center"
                disabled={!inputValue.trim()}
              >
                <FaPlus size={14} />
              </button>
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export default ExtendableDropdown;
