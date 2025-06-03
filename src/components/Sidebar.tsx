import { useState } from 'react'
import ZostikPOSLogo from "../assets/img/ZostikPOSLogo.png";
import ActiveLink from './ActiveLink';

function Sidebar() {
     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <>
      {/* Sidebar */}
      <div className="lg:block flex flex-col w-20 h-full bg-stone-200">
        <div className="flex justify-center items-center h-20">
          <img
            src={ZostikPOSLogo}
            alt="Logo"
            className="w-12 h-13 rounded-md"
          />
        </div>
        <div
          className="flex-grow mt-4 space-y-0"
          onClick={() => {
            if (isDropdownOpen) {
              setIsDropdownOpen(false);
            }
          }}
        >
          {["dashboard", "cart", "stock", "invoices", "persons"].map((page) => (
            <ActiveLink key={page} href={`/${page}`} page={page} />
          ))}
        </div>
        <div
          className="absolute bottom-0 left-0 mb-4 pt-4 h-20 w-18"
          onClick={() => {
            if (isDropdownOpen) {
              setIsDropdownOpen(false);
            }
          }}
        >
          <ActiveLink href="/settings" page="settings" />
        </div>
      </div>
    </>
  );
}

export default Sidebar

