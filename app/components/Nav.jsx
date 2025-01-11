"use client"
import { HiChartPie, HiMenu, HiX  } from "react-icons/hi";
import { useState } from "react";


export default function Nav() {

   const [menuToggle, setMenuToggle] = useState(false);

   return (
      <>
         <nav className="fixed top-0 h-[10vh] bg-blue-600 w-full text-white flex flex-row px-4 items-center shadow z-30">
            <div className="md:w-1/5 w-4/5 text-3xl font-semibold text-amber-400 text-center">
               <span className="inline-flex items-center">
                  PI.L<HiChartPie className="size-6" />T
               </span>
            </div>

            <div className="md:hidden flex justify-center items-center ">
               <button onClick={() => setMenuToggle((prev) => (!prev))}>

                  {menuToggle ? <HiX className="size-8" />  : <HiMenu className="size-8" /> }
                  
               </button>
            </div>

            <ul
               className={`md:w-2/5 w-full md:relative fixed top-0 left-0 md:flex md:flex-row flex-col md:bg-transparent bg-amber-400 md:text-white text-grey-900 justify-evenly md:h-auto md:m-0 mt-[10vh] md:font-normal font-medium items-center h-[45vh] ${menuToggle ? "flex" : "hidden"}`}
            >


               <li><a href="/">Products</a></li>
               <li><a href="/">Solutions</a></li>
               <li><a href="/">Pricing</a></li>
               <li><a href="https://shijisan-portfolio.vercel.app/">Developer</a></li>

            </ul>

            <ul
               className={`md:w-2/5 w-full md:relative fixed bottom-0 left-0 md:flex md:flex-row flex-col md:bg-transparent bg-amber-400 md:text-white text-grey-900 justify-evenly md:h-auto md:m-0 mt-[10vh] md:font-normal font-medium items-center h-[45vh] ${menuToggle ? "flex" : "hidden"}`}
            >


               <li><a href="/">Home</a></li>
               <li><a href="/">About</a></li>
               <li><a href="/dashboard">Dashboard</a></li>

            </ul>
         </nav>
      </>
   )
}