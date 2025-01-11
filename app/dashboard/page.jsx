"use client";
import { useEffect, useState } from "react";
import Logout from "../components/Logout";
import { HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [ownedOrganizations, setOwnedOrganizations] = useState([]);
  const [memberOrganizations, setMemberOrganizations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const [ownedRes, memberRes] = await Promise.all([
          fetch("/api/organizations/owned"),
          fetch("/api/organizations/member")
        ]);

        if (!ownedRes.ok || !memberRes.ok) {
          // If either request returns unauthorized, redirect to login
          if (ownedRes.status === 401 || memberRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch organizations');
        }

        const [ownedData, memberData] = await Promise.all([
          ownedRes.json(),
          memberRes.json()
        ]);

        setOwnedOrganizations(ownedData);
        setMemberOrganizations(memberData);
      } catch (error) {
        toast.error("Error fetching organizations");
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [router]);

  const handleCreateOrganization = async () => {
    if (!newOrganizationName.trim()) {
      toast.error("Organization name cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/organizations/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newOrganizationName }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(response.statusText);
      }

      const newOrg = await response.json();
      setOwnedOrganizations((prev) => [...prev, newOrg]);
      setMemberOrganizations((prev) => [...prev, { organization: newOrg }]);
      setShowCreateModal(false);
      setNewOrganizationName("");
      toast.success("Organization created successfully");
    } catch (error) {
      toast.error("Failed to create organization");
      console.error("Error creating organization:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-[10vh] flex flex-col justify-center items-center">
      <div className="p-4 max-w-6xl w-full rounded space-y-4">
        <div className="min-h-[45vh] border-b border-neutral-800">
          <h1 className="text-3xl drop-shadow-sm text-neutral-800 mb-4">Organizations Owned:</h1>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ownedOrganizations.length > 0 ? (
              ownedOrganizations.map((org) => (
                <li
                  key={org.id}
                  className="px-4 py-2 border rounded border-neutral-300 bg-neutral-200 shadow 
                           hover:cursor-pointer hover:scale-105 transition-all hover:bg-neutral-100 
                           hover:border-neutral-200 hover:shadow-md active:bg-blue-100"
                  onClick={() => router.push(`/organization/${org.id}`)}
                >
                  <h3 className="font-semibold">{org.name}</h3>
                  <h4 className="text-sm">Users: {org.userCount}</h4>
                  <h4 className="text-sm">Created: {new Date(org.createdAt).toLocaleDateString()}</h4>
                </li>
              ))
            ) : (
              <li className="col-span-full text-neutral-500 text-center">
                You don't own any organizations yet.
              </li>
            )}
          </ul>
        </div>

        <div className="min-h-[45vh]">
          <h1 className="text-3xl drop-shadow-sm text-neutral-800 mb-4">Organizations Joined:</h1>
          {memberOrganizations.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {memberOrganizations.map((member) => (
                <li
                  key={member.organization.id}
                  className="p-2 border bg-neutral-200 rounded border-neutral-300 shadow 
                           hover:cursor-pointer hover:scale-105 transition-all hover:bg-neutral-100 
                           hover:border-neutral-200 hover:shadow-md active:bg-blue-100"
                  onClick={() => router.push(`/organization/${member.organization.id}`)}
                >
                  <h3 className="font-semibold">{member.organization.name}</h3>
                  <h4 className="text-sm">Created: {new Date(member.organization.createdAt).toLocaleDateString()}</h4>
                  <h4 className="text-sm">Users: {member.organization.userCount || 0}</h4>
                  <h4 className="text-sm">Owner: {member.organization.owner.fullName}</h4>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500 text-center">You're not a member of any organizations yet.</p>
          )}
        </div>
      </div>

      <button
        className="fixed bottom-4 right-4 secondary-btn p-2 rounded-full shadow-lg 
                   hover:shadow-xl transition-all duration-200 bg-blue-500 text-white"
        onClick={() => setShowCreateModal(true)}
      >
        <HiPlus className="size-6" />
      </button>

      <Logout />

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Create New Organization</h2>
            <input
              type="text"
              value={newOrganizationName}
              onChange={(e) => setNewOrganizationName(e.target.value)}
              placeholder="Organization Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateOrganization();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleCreateOrganization}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}