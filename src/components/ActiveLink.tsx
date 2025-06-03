

import { Link, useLocation } from "wouter";
import { FaBoxesStacked, FaReceipt, FaUsers } from "react-icons/fa6";
import { FaTachometerAlt, FaShoppingCart, FaCogs } from "react-icons/fa";

interface ActiveLinkProps {
  href: string;
  page: string;
}

const iconMap: Record<string, any> = {
  dashboard: FaTachometerAlt,
  cart: FaShoppingCart,
  stock: FaBoxesStacked,
  invoices: FaReceipt,
  persons: FaUsers,
  settings: FaCogs,
};

const textMap: Record<string, string> = {
  dashboard: "Dashboard",
  cart: "Cart",
  stock: "Stock",
  invoices: "Invoices",
  persons: "Persons",
  settings: "Settings",
};

const ActiveLink = ({ href, page }: ActiveLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  const Icon = iconMap[page];

  return (
    <Link href={href}>
      <span className="flex flex-col items-center justify-center w-full h-20">
        <span
          className={`size-12 mb-1 flex items-center justify-center rounded-md shadow-md bg-gray-300 ${
            isActive ? "bg-green-300" : "hover:bg-green-200"
          } group`}
        >
          <Icon
            className={`text-2xl ${
              isActive ? "" : "group-hover:text-green-700"
            }`}
          />
        </span>
        <span className="text-xs">{textMap[page]}</span>
      </span>
    </Link>
  );
};

export default ActiveLink;
