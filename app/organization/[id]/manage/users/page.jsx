"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageOrgSideBar from "@/app/components/ManageOrgSideBar";
import { useParams } from "next/navigation";

const ROLES = {
  CREATOR: "CREATOR",
  MODERATOR: "MODERATOR",
  DEFAULT: "DEFAULT"
};

export default function ManageOrgUsers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState(ROLES.DEFAULT);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/organizations/${id}/members/`);
        if (!res.ok) {
          throw new Error(`Failed to load members: ${res.statusText}`);
        }
        const data = await res.json();
        setMembers(data.members);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error fetching members");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [id]);

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setRole(member.role);
    setShowModal(true);
  };

  const handleDeleteClick = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      toast.success("Member deleted successfully");
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting member");
      console.error("Delete error:", error);
    }
  };

  const handleLabelEdit = (member) => {
    setEditingLabel(member.id);
    setLabelInput(member.label || "");
  };

  const handleLabelSave = async (memberId) => {
   try {
     const res = await fetch(`/api/organizations/${id}/members/label`, {
       method: "PATCH",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         memberId,
         label: labelInput.trim() // Trim the input to handle whitespace
       }),
     });
 
     const data = await res.json();
 
     if (!res.ok) {
       throw new Error(data.error || "Failed to update label");
     }
 
     setMembers(prev =>
       prev.map(member =>
         member.id === memberId
           ? { ...member, label: labelInput.trim() }
           : member
       )
     );
     setEditingLabel(null);
     setLabelInput("");
     toast.success("Label updated successfully");
     
   } catch (error) {
     console.error("Error updating label:", error);
     toast.error(error.message || "Error updating label");
   }
 };

  const handleSaveChanges = async () => {
    if (!selectedMember) return;

    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setMembers(prev =>
        prev.map(member =>
          member.id === selectedMember.id ? { ...member, role } : member
        )
      );
      setShowModal(false);
      toast.success("Member updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating member");
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="flex w-full min-h-screen">
      <ManageOrgSideBar />
      <div className="flex-1 bg-white border-l border-neutral-300 p-8">
        <h1 className="text-3xl font-medium mb-8">Manage Members</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{member.user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingLabel === member.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => handleLabelSave(member.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingLabel(null)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{member.label || "No Label"}</span>
                          <button
                            onClick={() => handleLabelEdit(member)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(member)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Member Role</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.entries(ROLES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}