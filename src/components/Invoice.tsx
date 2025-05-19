
import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import ZostikLogo from "../assets/img/ZostikLogo.png";
import ZostikPOSLogo from "../assets/img/ZostikPOSLogo.png";
interface Shop {
  name: string;
  address: string;
  contact: string;
}

interface Person {
  name: string;
  contact: string;
}

interface Item {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface InvoiceProps {
  invoiceNo: string;
  date: string;
  shop: Shop;
  person: Person;
  username: string;
  items: Item[];
  total: number;
  taxRS: number;
  discountRS: number;
  net: number;
}

const Invoice: React.FC<InvoiceProps> = ({
  invoiceNo,
  date,
  shop,
  person,
  username,
  items,
  total,
  taxRS,
  discountRS,
  net,
}) => {
  return (
    <div className="bg-white p-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="grid grid-cols-2 border-b border-gray-200 pb-2 text-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-600">Invoice</h1>
          <p className="text-lg font-bold text-gray-500"># {invoiceNo}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold text-gray-700">{shop.name}</h2>
          <p className="text-gray-500">
            <FaLocationDot className="mr-0.5 text-gray-500 inline" />
            {shop.address}
          </p>
          <p className="text-blue-600 text-lg font-semibold">
            <FaPhoneAlt className="mr-0.5 text-blue-700 inline" />
            {shop.contact}
          </p>
        </div>
      </div>

      {/* Billing Info */}
      <div className="mt-2 text-sm grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-700">Bill To:</p>
          <p className="text-gray-600">{person.name}</p>
          <p className="text-gray-600">+{person.contact}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-700 font-semibold mb-4">{date}</p>
          <p className="text-gray-600">
            Username: <b>{username}</b>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mt-2 text-sm">
        <thead className="bg-green-100">
          <tr>
            <th className="border-light  px-2 py-1 text-left">
              Item
            </th>
            <th className="border-light  px-2 py-1 text-center">
              Qty
            </th>
            <th className="border-light  px-2 py-1 text-center">
              Unit Price
            </th>
            <th className="border-light  px-2 py-1 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="text-gray-700 bg-white">
              <td className="border-light  px-2 py-1">{item.name}</td>
              <td className="border-light  px-2 py-1 text-center">
                {item.qty}
              </td>
              <td className="border-light  px-2 py-1 text-center">
                Rs. {item.unitPrice}
              </td>
              <td className="border-light  px-2 py-1 text-right">
                Rs. {item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-2 grid grid-cols-2 text-sm w-full">
        <div></div>
        <div className="text-right">
          <div className="flex justify-between pt-2">
            <span className="font-semibold text-gray-700">Subtotal (Rs.):</span>
            <span className="text-gray-700">{total}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1">
            <span className="font-semibold text-gray-700">Tax (Rs.):</span>
            <span className="text-gray-700">{taxRS}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1">
            <span className="font-semibold text-gray-700">Discount (Rs.):</span>
            <span className="text-gray-700">{discountRS}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1 text-lg font-bold">
            <span className="text-gray-700">Total (Rs.):</span>
            <span className="text-gray-700">{net}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2  text-xs text-gray-600">
        <p className="pb-2">
          Payment is due within 15 days. Thank you for your business!
        </p>

        <div className="flex items-center text-md gap-3 text-gray-800 border-t border-gray-100 pt-2">
          <span>
            <img
              src={ZostikPOSLogo}
              alt="Logo"
              className="w-5 inline rounded-md mr-1"
            />
            Zostik POS
          </span>
          <span>
            <img
              src={ZostikLogo}
              alt="Logo"
              className="w-5 inline rounded-md mr-1"
            />
            www.zostik.com
          </span>
          <span>
            <FaPhoneAlt className="mr-1 text-blue-700 inline" />
            0300-1234567
          </span>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
