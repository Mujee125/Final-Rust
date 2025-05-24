import React from "react";

// Define TypeScript interfaces for the props
interface Shop {
  name: string;
  description: string;
  contact: string;
}

interface Invoice {
  invoice_no: string;
  date: string;
  received: number;
}

interface Person {
  name: string;
}

interface CartItem {
  name: string;
  qty: number;
  price: number;
  // Add other properties if needed
}

interface ReceiptProps {
  shop: Shop;
  invoice: Invoice;
  person: Person;
  username: string;
  cartItems: CartItem[];
  discountRS: number;
  taxRS: number;
  total: number;
  net: number;
}

const Receipt: React.FC<ReceiptProps> = ({
  shop,
  invoice,
  person,
  username,
  cartItems,
  discountRS,
  taxRS,
  total,
  net,
}) => {
  // Format the date by splitting at 'T' and taking the first part
  const formattedDate = invoice.date.split("T")[0];

  return (
    <div className="w-[250px] mx-auto text-xs font-mono text-center bg-gray-50 px-0 py-1">
      <div className="border-t-2 border-dashed border-gray-800 px-0 py-1">
        {/* Shop Information */}
        <h4 className="text-lg font-semibold">{shop.name}</h4>
        <p className="text-gray-600">{shop.description}</p>
        <p className="font-bold">Phone: {shop.contact}</p>

        {/* Invoice and Customer Information */}
        <div className="grid grid-cols-2 gap-1 text-gray-600">
          <span className="font-bold">{invoice.invoice_no}</span>
          <span>User: {username}</span>
          <span>{formattedDate}</span>
          <span>C: {person.name}</span>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mt-2 text-left">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="p-1">Sr</th>
              <th className="p-1">Item</th>
              <th className="p-1 text-right">Qty</th>
              <th className="p-1 text-right">Price</th>
              <th className="p-1 text-right">Sub</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td className="p-1">{index + 1}</td>
                <td className="p-1">{item.name}</td>
                <td className="p-1 text-right">{item.qty}</td>
                <td className="p-1 text-right">{item.price}</td>
                <td className="p-1 text-right">
                  {(item.qty * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Table */}
        <table className="w-full mt-1 text-left border-b border-gray-800 pb-1">
          <tbody>
            <tr>
              <td className="p-1 text-right text-gray-700">Discount (Rs.):</td>
              <td className="p-1 text-right">{discountRS}</td>
            </tr>
            <tr>
              <td className="p-1 text-right text-gray-700">Tax (Rs.):</td>
              <td className="p-1 text-right">{taxRS}</td>
            </tr>
            <tr className="font-bold border-t border-gray-400">
              <td className="p-1 text-right">Net Total (Rs.):</td>
              <td className="p-1 text-right">{total}</td>
            </tr>
            <tr>
              <td className="p-1 text-right text-gray-700">Paid (Rs.):</td>
              <td className="p-1 text-right">{invoice.received}</td>
            </tr>
            <tr>
              <td className="p-1 text-right text-gray-700">Balance (Rs.):</td>
              <td className="p-1 text-right">
                {(net - invoice.received)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center p-1 border-b-2 border-dashed border-gray-800 text-gray-600">
        ZostikPOS - Zostik.com - 13213244
      </div>
    </div>
  );
};

export default Receipt;
