"use client";

import { HiOutlineInformationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatContainer from "@/app/components/ChatContainer";

export default function Organization() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]); // State to hold members
  const [loading, setLoading] = useState(true);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [inviteEmail, setInviteEmail] = useState(""); // State for the email input
  const [role, setRole] = useState("DEFAULT"); // State for the user role
  const [showInviteModal, setShowInviteModal] = useState(false); // Toggle modal visibility
  const router = useRouter();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await fetch(`/api/organizations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrganization(data.organization);
          toast.success("Organization loaded successfully");
        } else {
          if (res.status === 401) {
            toast.error("Unauthorized access");
            router.push("/dashboard");
          } else {
            toast.error("Failed to load organization");
          }
        }
      } catch (error) {
        toast.error("Error fetching organization");
      } finally {
        setLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/organizations/${id}/member`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members); // Set the members list
        } else {
          toast.error("Failed to load members");
        }
      } catch (error) {
        toast.error("Error fetching members");
      }
    };

    if (id) {
      fetchOrganization();
      fetchMembers(); // Fetch members when the organization ID is available
    }
  }, [id, router]);

  const handleInviteSubmit = async () => {
    if (!inviteEmail || !role) {
      toast.error("Please provide both email and role.");
      return;
    }

    try {
      const res = await fetch(`/api/organizations/${id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inviteEmail, role }),
      });

      if (res.ok) {
        toast.success("User successfully added to the organization!");
        setInviteEmail(""); // Clear the input
        setRole("DEFAULT"); // Clear the role input
        setShowInviteModal(false); // Close the modal
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to add user.");
      }
    } catch (error) {
      toast.error("Error adding user.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <main className="min-h-screen w-full flex justify-center items-center pt-[10vh] p-4 flex-row">
        <div className="max-w-6xl w-full flex h-full flex-row justify-center items-center gap-4">
          {/* Organization Details */}
          <div className="w-4/5 h-full rounded-md border min-h-52 border-neutral-300 shadow bg-white p-4 flex flex-col">
            <div>
              <div className="inline-flex w-full items-center justify-between relative">
                <div className="flex flex-row items-center">
                  <h1 className="text-3xl me-1">{organization.name}</h1>
                  <div className="group w-6 h-6">
                    <HiOutlineInformationCircle className="w-full h-full" />
                    <div className="hidden group-hover:block absolute top-0 left-20 z-10 rounded shadow border border-neutral-300 mt-2 p-2 bg-white min-w-[200px]">
                      <p>Created At: {new Date(organization.createdAt).toLocaleDateString()}</p>
                      <p>Owner: {organization.owner?.fullName || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                <div className="gap-4 flex flex-row">
                  <button
                    className="primary-btn"
                    onClick={() => setShowInviteModal(true)} // Show modal when clicked
                  >
                    Invite Users
                  </button>
                  <button className="secondary-btn">Manage Organization</button>
                </div>
              </div>

              {/* Chatroom Section */}
              <div className="flex mt-4 gap-4">
                {/* Chat Container Integration */}
                <div className="w-full h-full min-h-96 p-4 rounded-md border bg-white shadow">
                  <ChatContainer />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Users List */}
          <div className="w-1/5 shadow border min-h-96 border-neutral-300 rounded-md bg-white h-full flex flex-col">
            <h2 className="px-4 pt-4 text-xl">Members</h2>
            <ol className="list-decimal list-inside">
              {Array.isArray(members) && members.length > 0 ? (
                members.map((member) => (
                  <li className="odd:bg-neutral-100 px-4 py-2" key={member.id}>
                    {member.user?.fullName || 'Unknown User'} - {member.role || 'No Role'}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No users found</li>
              )}
            </ol>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">Add User</h2>
            <input
              type="email"
              className="w-full p-2 border border-neutral-300 rounded-md mb-4"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <select
              className="w-full p-2 border border-neutral-300 rounded-md mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CREATOR">Creator</option>
              <option value="MODERATOR">Moderator</option>
              <option value="DEFAULT">Default</option>
            </select>

            <div className="flex justify-between">
              <button
                className="primary-btn"
                onClick={handleInviteSubmit}
              >
                Add User
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowInviteModal(false)} // Close modal
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
