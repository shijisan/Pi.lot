"use client";
import { use, useEffect, useState } from "react";
import Logout from "../components/Logout";
import { HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function Dashboard() {
	const [ownedOrganizations, setOwnedOrganizations] = useState([]);
	const [memberOrganizations, setMemberOrganizations] = useState([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newOrganizationName, setNewOrganizationName] = useState("");
	const router = useRouter();

	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				const ownedRes = await fetch("/api/organizations/owned");
				const ownedData = await ownedRes.json();
				setOwnedOrganizations(ownedData);

				const memberRes = await fetch("/api/organizations/member");
				const memberData = await memberRes.json();
				setMemberOrganizations(memberData);
			} catch (error) {
				console.error("Error fetching organizations:", error);
			}
		};

		fetchOrganizations();
	}, []);

	const handleCreateOrganization = async () => {
		if (!newOrganizationName.trim()) {
			return alert("Organization name cannot be empty.");
		}

		try {
			const response = await fetch("/api/organizations/make", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: newOrganizationName }),
			});

			if (response.ok) {
				const newOrg = await response.json();
				setOwnedOrganizations((prev) => [...prev, newOrg]);
				setMemberOrganizations((prev) => [...prev, { organization: newOrg }]);
				setShowCreateModal(false);
				setNewOrganizationName("");
			} else {
				console.error("Failed to create organization:", response.statusText);
			}
		} catch (error) {
			console.error("Error creating organization:", error);
		}
	};

	return (
		<main className="min-h-screen pt-[10vh] flex flex-col justify-center items-center">
			<div className="p-4 max-w-6xl w-full rounded space-y-4">
				<div className="min-h-[45vh] border-b border-neutral-800">
					<h1 className="text-3xl drop-shadow-sm text-neutral-800 mb-4">Organizations Owned:</h1>
					<ul className="grid grid-cols-4 gap-4">
						<li className="p-2 flex justify-center items-center fixed bottom-4 right-4">
							<button
								className="secondary-btn px-2 inline-flex items-center justify-center rounded-lg aspect-square"
								onClick={() => setShowCreateModal(true)}
							>
								<HiPlus className="size-6" />
							</button>
						</li>
						{ownedOrganizations.length > 0 ? (
							ownedOrganizations.map((org) => (
								<li key={org.id} className="px-4 py-2 border rounded border-neutral-300 bg-neutral-200 shadow hover:cursor-pointer hover:scale-105 transition-all hover:bg-neutral-100 hover:border-neutral-200 hover:shadow-md active:bg-blue-100" onClick={() => router.push(`/organization/${org.id}`)} >
									<h3 className="">{org.name}</h3>
									<h4 className="text-sm">Users: {org.userCount}</h4>
									<h4 className="text-sm">Created At: {new Date(org.createdAt).toLocaleDateString()}</h4>
								</li>
							))
						) : (
							<li className="col-span-4 text-neutral-500 text-center">You don't own any organizations yet.</li>
						)}
					</ul>
				</div>

				<div className="min-h-[45vh]">
					<h1 className="text-3xl drop-shadow-sm text-neutral-800 mb-4">Organizations Joined:</h1>
					{memberOrganizations.length > 0 ? (
						<ul className="grid grid-cols-4 gap-4">
							{memberOrganizations.map((member) => (
								<li key={member.organization.id} className="p-2 border bg-neutral-200 rounded border-neutral-300 shadow hover:cursor-pointer hover:scale-105 transition-all hover:bg-neutral-100 hover:border-neutral-200 hover:shadow-md active:bg-blue-100" onClick={() => router.push(`/organization/${member.organization.id}`)}>
									<h3>{member.organization.name}</h3>
									<h4>Created At: {new Date(member.organization.createdAt).toLocaleDateString()}</h4>
									<h4>Users: {member.organization.userCount || 0}</h4>
									<h4>Owner: {member.organization.owner.fullName}</h4>
								</li>
							))}
						</ul>
					) : (
						<p className="text-neutral-500 text-center">You’re not a member of any organizations yet.</p>
					)}
				</div>
			</div>

			<Logout />

			{showCreateModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
						<h2 className="text-lg font-semibold mb-4">Create New Organization</h2>
						<input
							type="text"
							value={newOrganizationName}
							onChange={(e) => setNewOrganizationName(e.target.value)}
							placeholder="Organization Name"
							className="w-full p-2 border border-gray-300 rounded mb-4"
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
