"use client"

import { useParams } from "next/navigation"

export default function ManageOrgSideBar(){

   const { id } = useParams();

   return(
      <>
      <div className="max-w-xs w-full flex flex-col bg-white pt-[10vh] border border-neutral-300">
         <h1 className="text-3xl font-medium text-center my-4">Manage</h1>
         <ul className="flex flex-col items-center odd:bg-neutral-300">
            <li className="py-2 w-full h-full text-center"><a href={`/organization/${id}/manage/dashboard`} className="py-2 w-full h-full">Dashboard</a></li>
            <li className="py-2 w-full h-full text-center"><a href={`/organization/${id}/manage/chatrooms`} className="py-2 w-full h-full">Chatrooms</a></li>
            <li className="py-2 w-full h-full text-center"><a href={`/organization/${id}/manage/users`} className="py-2 w-full h-full">Users</a></li>
         </ul>
      </div>
      </>
   )
}