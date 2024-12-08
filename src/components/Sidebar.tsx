import { useState } from 'react';
import logo from '../assets/thinly.svg'
import { MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from 'react-icons/io5';
import { LiaLinkSolid } from "react-icons/lia";
import { FaUserCircle } from "react-icons/fa";
import { RiQrCodeLine } from "react-icons/ri";
import { MdArticle } from "react-icons/md";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { RiSettings4Fill } from "react-icons/ri";

const menuItems = [
  {
    icons: <IoHomeOutline size={30} />,
    label: 'Home'
  },
  {
    icons: <LiaLinkSolid size={30}/>,
    label: 'Links'
  },
  {
    icons: <RiQrCodeLine size={30}/>,
    label: 'QR Codes'
  },
  {
    icons: <MdArticle size={30}/>,
    label: 'Pages'
  },
  {
    icons: <TbBrandGoogleAnalytics size={30}/>,
    label: 'Analytics'
  },
  {
    icons: <RiSettings4Fill size={30}/>,
    label: 'Settings'
  }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className='flex flex-column justify-center absolute h-screen'>
      <nav className={`shadow-md h-screen mr-2 duration-500 bg-white text-indigo-700 ${isOpen ? 'w-60' : 'w-16'}`}>
        <div className='border-b px-3 py-2 h-20 flex items-center'>
          <img src={logo} alt='thinly' className={`rounded-md ${isOpen ? 'w-24' : 'w-0'}`} />
          <MdMenuOpen size={34} className={`cursor-pointer duration-500 ${!isOpen && 'rotate-180'}`} onClick={() => setIsOpen(!isOpen)}/>
        </div>

        {/* Body */}
        <ul>
          {
            menuItems.map((item, index) => (
              <li key={index} className='px-3 py-2 my-2 hover:bg-indigo-200 rounded-md cursor-pointer flex gap-2 relative group'>
                <div>{item.icons}</div>
                <p className={`${!isOpen && 'w-0 translate-x-24'} hover:bg-indigo-200 overflow-hidden`}>{item.label}</p>
                {!isOpen && (
                  <div className={`
                    absolute left-full rounded-md px-2 py-1 ml-6
                    bg-indigo-100 text-indigo-800 text-sm
                    invisible opacity-20 -translate-x-3 transition-all
                    group-hover:visible group-hover:opacity-100 translate-x-0
                  `}>
                    {item.label}
                  </div>
                )}
              </li>
            ))
          }
        </ul>
        {/* Footer */}
        <div className='border-t flex px-3 py-2 my-2 hover:bg-indigo-200 cursor-pointer gap-2 relative group'>
          <div><FaUserCircle size={30} /></div>
          <div className='flex justify-between items-center'>
            <div className='leading-5'>
              <p className={`${!isOpen && 'w-0 translate-x-24'} font-semibold duration-500 overflow-hidden`}>Profile</p>
              <p className={`${isOpen && 'hidden'} absolute left-32 shadow-md
                w-0 p-0
                text-black
                bg-white
                duration-200
                overflow-hidden
                group-hover:w-fit
                group-hover:p-2
                group-hover:left-20
              `}>
                Profile
              </p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}