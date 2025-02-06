"use client";

import { useParams } from "next/navigation";

export default function Sidebar() {
   const { id } = useParams();

   return (
      <div className="w-1/5 min-h-96 shadow border border-neutral-300 rounded-md py-4 bg-white">

         <a href="/dashboard" className="w-full inline-flex justify-center items-center hover:bg-neutral-100 transition-colors p-3">
            Dashboard
         </a>
         <a href={`/organization/${id}`} className="w-full inline-flex justify-center items-center hover:bg-neutral-100 transition-colors p-3">
            Chatrooms
         </a>
         <a href={`/organization/${id}/crm`} className="w-full inline-flex justify-center items-center hover:bg-neutral-100 transition-colors p-3">
            CRM
         </a>
         <a href={`/organization/${id}/tasks`} className="w-full inline-flex justify-center items-center hover:bg-neutral-100 transition-colors p-3">
            Tasks
         </a>
      </div>
   );
}
