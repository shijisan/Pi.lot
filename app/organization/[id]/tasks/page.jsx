"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { FaPlus, FaPencil, FaTrash } from "react-icons/fa6";

export default function Tasks() {
   const { id: organizationId } = useParams();
   const [searchQuery, setSearchQuery] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isUserModalOpen, setIsUserModalOpen] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [selectedUser, setSelectedUser] = useState(null);
   const [tasks, setTasks] = useState([]);
   const [users, setUsers] = useState([]);
   const [filteredUsers, setFilteredUsers] = useState([]);
   const [taskDetails, setTaskDetails] = useState({ title: "", description: "", status: "PENDING", priority: "", dueDate: "", assignedTo: null });

   useEffect(() => {
      async function fetchTasks() {
         const res = await fetch(`/api/organizations/${organizationId}/task`);
         const data = await res.json();
         setTasks(data);
      }
      fetchTasks();
   }, [organizationId]);

   useEffect(() => {
      async function fetchUsers() {
         const res = await fetch(`/api/organizations/${organizationId}/users/get`);
         const data = await res.json();
         setUsers(data.members);
         setFilteredUsers(data.members);
      }
      fetchUsers();
   }, [organizationId]);

   const openEditModal = (task = null) => {
      setSelectedTask(task);
      setTaskDetails(task || { title: "", description: "", status: "PENDING", priority: "", dueDate: "", assignedTo: null });
      setIsModalOpen(true);
   };

   const closeModal = () => {
      setIsModalOpen(false);
      setIsUserModalOpen(false);
      setSelectedTask(null);
      setSelectedUser(null);
      setTaskDetails({ title: "", description: "", status: "PENDING", priority: "", dueDate: "", assignedTo: null });
   };

   const handleUserSearch = (e) => {
      const query = e.target.value.toLowerCase();
      setFilteredUsers(users.filter(user => user.user.fullName.toLowerCase().includes(query)));
   };

   const assignUser = (user) => {
      setSelectedUser(user.user);
      setTaskDetails(prev => ({ ...prev, assignedTo: user.user.id }));
      setIsUserModalOpen(false); 
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setTaskDetails(prev => ({ ...prev, [name]: value }));
   };

   const saveTask = async () => {
      const method = selectedTask ? "PATCH" : "POST";  
      const url = selectedTask 
         ? `/api/organizations/${organizationId}/task/${selectedTask.id}` 
         : `/api/organizations/${organizationId}/task`;
   
      // Ensure all required fields are included
      const requestData = {
         title: taskDetails.title,
         description: taskDetails.description,
         status: taskDetails.status || "PENDING", // Default to "PENDING" if status is not set
         priority: taskDetails.priority || "NORMAL", // Default to "NORMAL" if priority is not set
         dueDate: taskDetails.dueDate,
         assignedToId: taskDetails.assignedTo || null, 
      };

      await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(requestData),
      });
   
      const res = await fetch(`/api/organizations/${organizationId}/task`);
      const data = await res.json();
      setTasks(data);  
   
      closeModal();
   };

   const handleDelete = async (taskId) => {
      const res = await fetch(`/api/organizations/${organizationId}/task/${taskId}`, {
         method: "DELETE",
      });

      if (res.ok) {
         setTasks(prev => prev.filter(task => task.id !== taskId));
      }
   };

   // Filter tasks based on the search query
   const filteredTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <>
         <main className="flex pt-[10vh] flex-col min-h-screen md:h-screen h-full w-full justify-center items-center">
            <div className="p-4 w-full h-full flex justify-center items-center flex-col">
               <div className="max-w-6xl w-full h-full flex flex-row gap-4">
                  <Sidebar />

                  <div className="w-4/5 flex flex-col h-full rounded-lg bg-white border border-neutral-300 shadow">
                     <div className="w-full flex flex-row justify-between items-center border-b p-4 border-neutral-300">
                        <h1 className="text-3xl font-medium">Tasks</h1>
                        <input
                           className="rounded-full border border-neutral-300 py-2 px-4 max-w-96 w-full bg-neutral-100 focus:outline-none"
                           placeholder="Search..."
                           type="search"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={() => openEditModal()} className="h-full secondary-btn w-fit">
                           <FaPlus className="inline-flex me-2" />
                           Add Task
                        </button>
                     </div>

                     <div className="p-4">
                        {filteredTasks.length > 0 ? (
                           <ul>
                              {filteredTasks.map((task) => (
                                 <li key={task.id} className="flex justify-between items-center p-2 border-b">
                                    <div>
                                       <h3 className="font-medium">{task.title}</h3>
                                       <p className="text-sm text-gray-600">{task.description || "No description"}</p>
                                       <p className="text-sm">Status: {task.status}</p>
                                       <p className="text-sm">Priority: {task.priority}</p>
                                       <p className="text-sm">Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</p>
                                       <p className="text-sm">Assigned To: {task.assignedTo ? task.assignedTo.fullName : "Unassigned"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => openEditModal(task)} className="text-blue-500 hover:text-blue-700">
                                          <FaPencil size={20} />
                                       </button>
                                       <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700">
                                          <FaTrash size={20} />
                                       </button>
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p className="text-center text-gray-500">No tasks found.</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </main>

         {/* Task Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-2xl font-medium">{selectedTask ? "Edit Task" : "New Task"}</h2>
                  <input
                     name="title"
                     className="w-full p-2 border rounded mb-2"
                     placeholder="Task Title"
                     value={taskDetails.title}
                     onChange={handleChange}
                  />
                  <textarea
                     name="description"
                     className="w-full p-2 border rounded mb-2"
                     placeholder="Task Description"
                     value={taskDetails.description}
                     onChange={handleChange}
                  />

                  {/* Due Date */}
                  <div className="mb-2">
                     <label className="block font-medium">Due Date:</label>
                     <p>{taskDetails.dueDate ? new Date(taskDetails.dueDate).toLocaleDateString() : "No due date"}</p>
                  </div>

                  <input
                     name="dueDate"
                     type="date"
                     className="w-full p-2 border rounded mb-2"
                     value={taskDetails.dueDate}
                     onChange={handleChange}
                  />

                  {/* Status Dropdown */}
                  <div className="mb-2">
                     <label className="block font-medium">Status:</label>
                     <select
                        name="status"
                        value={taskDetails.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mb-2"
                     >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                     </select>
                  </div>

                  {/* Assigned User */}
                  <div className="mb-2">
                     <label className="block font-medium">Assigned To:</label>
                     <p>{selectedUser ? selectedUser.fullName : taskDetails.assignedTo ? taskDetails.assignedTo.fullName : "Unassigned"}</p>
                  </div>

                  <button
                     onClick={() => setIsUserModalOpen(true)}
                     className="w-full p-2 bg-gray-200 rounded mb-2"
                  >
                     Select user to assign
                  </button>
                  {selectedUser && <p>Assigned To: {selectedUser.fullName}</p>}

                  <button
                     onClick={saveTask}
                     className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mt-2"
                  >
                     Save Task
                  </button>
                  <button
                     onClick={closeModal}
                     className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors mt-2"
                  >
                     Close
                  </button>
               </div>
            </div>
         )}


         {/* User Selection Modal */}
         {isUserModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-2xl font-medium">Select a User</h2>
                  {filteredUsers.map(user => (
                     <button key={user.user.id} onClick={() => assignUser(user)} className="block w-full p-2 border rounded mb-2">{user.user.fullName}</button>
                  ))}
               </div>
            </div>
         )}
      </>
   );
}
