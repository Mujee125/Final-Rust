interface InputProps {
  id?: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
    disabled = false,
    className = "",
}: InputProps) {
  return (
    <div className={`${className}`}>
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full p-2 text-sm border-light rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
