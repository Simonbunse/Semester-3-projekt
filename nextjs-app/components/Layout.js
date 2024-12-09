import Nav from "@/components/Nav";
import { useState } from "react";

export default function Layout({children}) {
  const [showNav, setShowNav] = useState(false);
    return(
        <div className="bg-bgGray min-h-screen">
        <div className="md:hidden flex items-center p-4">
            <button onClick={() => setShowNav(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
            </button>
            <div className="flex grow justify-center mr-6">
            </div>
        </div>
        <div className="flex">
            <Nav show={showNav} />
            <div className="bg-white flex-grow p-4">
            {children}
            </div>
        </div>
        </div>
    )
}
