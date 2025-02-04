"use client";

import { HiOutlineInformationCircle, HiChevronLeft } from "react-icons/hi";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatContainer from "@/app/components/ChatContainer";
import Sidebar from "@/app/components/Sidebar";


export default function Organization() {
	const { id } = useParams();
	const [organization, setOrganization] = useState(null);
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [inviteEmail, setInviteEmail] = useState("");
	const [role, setRole] = useState("DEFAULT");
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [userRole, setUserRole] = useState(null);
	const router = useRouter();

	useEffect(() => {
		const fetchOrganizationAndMembers = async () => {
			try {
				setLoading(true);
				const [orgRes, membersRes] = await Promise.all([
					fetch(`/api/organizations/${id}`),
					fetch(`/api/organizations/${id}/members`)
				]);

				if (orgRes.ok) {
					const orgData = await orgRes.json();
					setOrganization(orgData.organization);
					setUserRole(orgData.currentUserRole);
					toast.success("Organization loaded successfully");
				} else {
					if (orgRes.status === 401) {
						toast.error("Unauthorized access");
						router.push("/dashboard");
					} else {
						toast.error("Failed to load organization");
					}
				}

				if (membersRes.ok) {
					const membersData = await membersRes.json();
					setMembers(membersData.members);
				} else {
					toast.error("Failed to load members");
				}
			} catch (error) {
				toast.error("Error fetching organization or members");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchOrganizationAndMembers();
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
				setInviteEmail("");
				setRole("DEFAULT");
				setShowInviteModal(false);
			} else {
				const errorData = await res.json();
				toast.error(errorData.error || "Failed to add user.");
			}
		} catch (error) {
			toast.error("Error adding user.");
		}
	};

	const handleManageOrg = () => {
		router.push(`/organization/${id}/manage/dashboard`);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!organization) {
		return <div>Organization not found.</div>;
	}

	return (
		<>
			<main className="w-full md:h-screen min-h-screen  flex justify-center items-center pt-[10vh] p-4 flex-row">
				<div className="p-4 max-w-6xl w-full flex h-full flex-row justify-center gap-4">	

					<Sidebar />

					<div className="w-3/5 h-full rounded-lg border border-neutral-300 shadow bg-white p-4 flex flex-col">
						<div className="h-full flex flex-col">
							<div className="inline-flex border-b border-neutral-300 p-4 w-full items-center justify-between relative">
								<div className="flex flex-row items-center">
									<h1 className="text-3xl font-medium me-2">{organization.name}</h1>
									<div className="group w-6 h-6">
										<HiOutlineInformationCircle className="w-full h-full" />
										<div className="hidden group-hover:block absolute bottom-1 left-24 z-10 rounded shadow border border-neutral-300 mt-2 p-2 bg-white min-w-[200px]">
											<p>Created At: {new Date(organization.createdAt).toLocaleDateString()}</p>
											<p>Owner: {organization.owner?.fullName || 'Unknown'}</p>
										</div>
									</div>
								</div>
								<div className="gap-4 flex flex-row">
									{userRole === "CREATOR" || userRole === "MODERATOR" ? (
										<>
											<button
												className="secondary-btn"
												onClick={handleManageOrg}
											>
												Manage Organization
											</button>
											<button
												className="primary-btn"
												onClick={() => setShowInviteModal(true)}
											>
												Invite Users
											</button>
										</>
									) : null}
								</div>
							</div>
							<div className="flex-grow gap-4">
								<div className="w-full h-full p-4 rounded-b-md border-t-0 border bg-neutral-100 shadow">
									<ChatContainer />
								</div>
							</div>
						</div>
					</div>
					
					<div className="w-1/5 h-full shadow border border-neutral-300 rounded-md bg-white">
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
							<button className="primary-btn" onClick={handleInviteSubmit}>
								Add User
							</button>
							<button className="secondary-btn" onClick={() => setShowInviteModal(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			<ToastContainer autoClose={1500} />
		</>
	);
}
