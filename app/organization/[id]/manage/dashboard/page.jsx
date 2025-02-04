import ManageOrgSideBar from "@/app/components/ManageOrgSideBar"

export default function ManageOrgDashboard() {
   return (
      <>
         <main className="flex flex-row w-full h-screen justify-center">
            <div className="max-w-6xl flex w-full">
               <ManageOrgSideBar />
               <div className="flex w-full pt-[10vh] min-h-screen px-4 pb-4 bg-white border border-neutral-300">
                  <h1 className="text-3xl font-medium mt-4">This is the dashboard :)</h1>
               </div>
            </div>
         </main>
      </>
   )
}