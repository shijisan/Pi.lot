"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { FaPlus, FaPencil, FaTrash } from "react-icons/fa6";

export default function CRM() {
   const { id: organizationId } = useParams();
   const [contacts, setContacts] = useState([]);
   const [filteredContacts, setFilteredContacts] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedContact, setSelectedContact] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      position: "",
      company: "",
      notes: ""
   });

   useEffect(() => {
      if (organizationId) fetchContacts();
   }, [organizationId]);

   useEffect(() => {
      handleSearch();
   }, [searchQuery, contacts]);

   async function fetchContacts() {
      const res = await fetch(`/api/organizations/${organizationId}/crm`);
      const data = await res.json();
      setContacts(data);
   }

   function handleSearch() {
      if (!searchQuery) {
         setFilteredContacts(contacts);
         return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const filtered = contacts.filter(contact =>
         [contact.fullName, contact.email, contact.phone, contact.position, contact.company]
            .some(field => field?.toLowerCase().includes(lowerQuery))
      );

      setFilteredContacts(filtered);
   }

   async function handleSave() {
      const method = selectedContact ? "PATCH" : "POST";
      const url = selectedContact
         ? `/api/organizations/${organizationId}/crm/${selectedContact.id}`
         : `/api/organizations/${organizationId}/crm`;

      const res = await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
      });

      if (res.ok) {
         fetchContacts();
         closeEditModal();
      }
   }

   async function handleDelete(contactId) {
      if (!confirm("Are you sure you want to delete this contact?")) return;

      const res = await fetch(`/api/organizations/${organizationId}/crm/${contactId}`, {
         method: "DELETE",
      });

      if (res.ok) {
         fetchContacts();
         closeModals();
      }
   }

   function openDetailModal(contact) {
      setSelectedContact(contact);
      setIsModalOpen(true);
   }

   function openEditModal(contact = null) {
      setSelectedContact(contact);
      setFormData(contact || {
         fullName: "",
         email: "",
         phone: "",
         position: "",
         company: "",
         notes: ""
      });
      setIsEditModalOpen(true);
   }

   function closeModals() {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedContact(null);
   }

   function closeEditModal() {
      setIsEditModalOpen(false);
      setSelectedContact(null);
   }

   return (
      <>
         <main className="flex pt-[10vh] flex-col min-h-screen md:h-screen h-full w-full justify-center items-center">
            <div className="p-4 w-full h-full flex justify-center items-center flex-col">
               <div className="max-w-6xl w-full h-full flex flex-row gap-4">
                  <Sidebar />

                  <div className="w-4/5 flex flex-col h-full rounded-lg bg-white border border-neutral-300 shadow">
                     <div className="w-full flex flex-row justify-between items-center border-b p-4 border-neutral-300">
                        <h1 className="text-3xl font-medium">Contacts</h1>
                        <input
                           className="rounded-full border border-neutral-300 py-2 px-4 max-w-96 w-full bg-neutral-100 focus:outline-none"
                           placeholder="Search..."
                           type="search"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={() => openEditModal()} className="h-full secondary-btn w-fit">
                           <FaPlus className="inline-flex me-2" />
                           Add Contact
                        </button>
                     </div>

                     <div className="p-4">
                        {filteredContacts.length === 0 ? (
                           <p className="text-center text-gray-500">No contacts found.</p>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredContacts.map((contact) => (
                                 <div
                                    key={contact.id}
                                    onClick={() => openDetailModal(contact)}
                                    className="border border-neutral-300 p-4 rounded-lg bg-neutral-50 shadow-md hover:bg-neutral-100 cursor-pointer transition-colors"
                                 >
                                    <h3 className="text-lg font-medium">{contact.fullName}</h3>
                                    <p className="text-gray-600">{contact.email || "No email"}</p>
                                    <p className="text-gray-600">{contact.phone || "No phone"}</p>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </main>

         {isModalOpen && selectedContact && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-medium">{selectedContact.fullName}</h2>
                     <div className="flex gap-2">
                        <button 
                           onClick={() => {
                              closeModals();
                              openEditModal(selectedContact);
                           }} 
                           className="text-blue-500 hover:text-blue-700"
                        >
                           <FaPencil size={20} />
                        </button>
                        <button 
                           onClick={() => handleDelete(selectedContact.id)} 
                           className="text-red-500 hover:text-red-700"
                        >
                           <FaTrash size={20} />
                        </button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <p><strong>Email:</strong> {selectedContact.email || "N/A"}</p>
                     <p><strong>Phone:</strong> {selectedContact.phone || "N/A"}</p>
                     <p><strong>Position:</strong> {selectedContact.position || "N/A"}</p>
                     <p><strong>Company:</strong> {selectedContact.company || "N/A"}</p>
                     <p><strong>Notes:</strong> {selectedContact.notes || "N/A"}</p>
                  </div>
                  <div className="mt-6">
                     <button 
                        onClick={closeModals} 
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                     >
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}

         {isEditModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-medium">{selectedContact ? "Edit Contact" : "Add Contact"}</h2>
                  <div className="flex flex-col gap-2 mt-4">
                     <input
                        type="text"
                        placeholder="Full Name"
                        className="border border-gray-300 p-2 rounded"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                     />
                     <input
                        type="email"
                        placeholder="Email"
                        className="border border-gray-300 p-2 rounded"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     />
                     <input
                        type="tel"
                        placeholder="Phone"
                        className="border border-gray-300 p-2 rounded"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                     />
                     <input
                        type="text"
                        placeholder="Position"
                        className="border border-gray-300 p-2 rounded"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                     />
                     <input
                        type="text"
                        placeholder="Company"
                        className="border border-gray-300 p-2 rounded"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                     />
                     <textarea
                        placeholder="Notes"
                        className="border border-gray-300 p-2 rounded min-h-[100px]"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                     />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                     <button onClick={closeEditModal} className="px-4 py-2 bg-gray-500 text-white rounded">
                        Cancel
                     </button>
                     <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Save
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
