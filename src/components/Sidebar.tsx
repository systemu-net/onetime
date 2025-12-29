import { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { IoHomeOutline } from 'react-icons/io5';
import { LiaLinkSolid } from "react-icons/lia";
import { MdMenuOpen, MdPhoneIphone } from "react-icons/md";
import { RiQrCodeLine, RiSettings4Fill } from "react-icons/ri";
import { SiPagespeedinsights, SiThingiverse } from "react-icons/si";


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
    icons: <MdPhoneIphone size={30}/>,
    label: 'Pages'
  },
  {
    icons: <SiPagespeedinsights size={30}/>,
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
    <aside className='z-index-31 flex flex-column justify-center h-screen fixed top-0 left-0'>
      <nav className={`shadow-md h-screen mr-2 duration-500 bg-white text-indigo-700 ${isOpen ? 'w-60' : 'w-16'}`}>
        <div className={`border-b px-3 py-2 h-20 ${isOpen && 'justify-between'} flex items-center`}>
          <SiThingiverse size={30} className={`rounded-md ${isOpen ? 'h-24' : 'w-0'}`}/>
          <MdMenuOpen size={30} className={`cursor-pointer duration-500 ${!isOpen && 'rotate-180'}`} onClick={() => setIsOpen(!isOpen)}/>
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