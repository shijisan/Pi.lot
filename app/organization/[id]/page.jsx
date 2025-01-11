"use client";

import { HiOutlineInformationCircle } from "react-icons/hi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function Organization() {
	const { id } = useParams();
	const [organization, setOrganization] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrganization = async () => {
			try {
				const res = await fetch(`/api/organizations/${id}`);
				if (res.ok) {
					const data = await res.json();
					setOrganization(data);
					toast.success("Organization loaded successfully");
				} else {
					toast.error("Failed to load organization");
				}
			} catch (error) {
				toast.error("Error fetching organization");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchOrganization();
		}
	}, [id]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<main className="min-h-screen w-full flex justify-center items-center pt-[10vh] p-4 flex-row">
				<div className="max-w-6xl w-full flex h-full flex-row justify-center items-center gap-4">
					<div className="w-3/5 h-full rounded-md border min-h-52 border-neutral-300 shadow bg-white p-4 flex flex-col">
						{organization ? (
							<div>

								<div className="inline-flex w-full items-center justify-between relative"> 
									<div className="flex flex-row items-center">
									<h1 className="text-3xl me-1">{organization.name}</h1>
										<div className="group w-6 h-6"> 
											<HiOutlineInformationCircle className="w-full h-full" />
											

											<div className="hidden group-hover:block absolute top-0 left-20 z-10 rounded shadow border border-neutral-300 mt-2 p-2 bg-white min-w-[200px]">
													<p>Created At: {new Date(organization.createdAt).toLocaleDateString()}</p>
													<p>Owner: {organization.owner.fullName}</p>
											</div>
										</div>
									</div>
									<div className="gap-4 flex flex-row">
										<button className="primary-btn">Invite Users</button>
										<button className="secondary-btn">Manage Organization</button>
									</div>


								</div>
							</div>
						) : (
							<p>Organization not found.</p>
						)}
					</div>

					<div className="w-2/5 shadow border min-h-52 border-neutral-300 rounded-md bg-white h-full flex flex-col">
						{organization ? (
							<div>
								<h2 className="px-4 pt-4 text-xl">Users</h2>
								<ol className="list-decimal list-inside">
									{organization.users.map((orgUser) => (
										<li className="odd:bg-neutral-100 px-4 py-2" key={orgUser.user.id}>
											{orgUser.user.fullName} - {orgUser.role}
										</li>
									))}
								</ol>
							</div>
						) : (
							<p className="px-4 pt-4">Organization not found.</p>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
