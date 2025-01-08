"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function Register() {

	const router = useRouter();

	const [formData, setFormData] = useState({ email: "", firstName: "", lastName: "", password: "", confirmPassword: "" });

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		const fullName = `${formData.firstName} ${formData.lastName}`;

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email, fullName, password: formData.password }),
			});

			if (res.ok) {
				toast.success("Registration successful");
				setTimeout(() => {
				  router.push("/dashboard");
				}, 3000);
			} else {
				toast.error("Registration failed");
			}
		} catch (err) {
			toast.error("An error occurred");
		}
	};

	return (
		<>
			<main className="min-h-screen flex flex-col justify-center items-center pt-[10vh]">
				<form className="rounded-lg bg-white border border-neutral-300 w-full max-w-sm p-4 shadow-sm" onSubmit={handleSubmit}>
					<h1 className="text-3xl font-medium text-center text-neutral-900">Register</h1>
					<div className="flex flex-col mb-4">
						{["firstName", "lastName", "email", "password", "confirmPassword"].map((field) => (
							<div key={field} className="flex flex-col-reverse">
								<input
									type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
									name={field}
									value={formData[field]}
									onChange={handleInputChange}
									className="primary-input peer"
									placeholder=" "
									required
								/>
								<label htmlFor={field} className="primary-input-label">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}</label>
							</div>
						))}
					</div>
					<div className="flex justify-evenly items-center flex-col">
						<button type="submit" className="primary-btn w-full mb-8">Register</button>
						<small>Already have an account? <a className="text-blue-600 hover:text-blue-500 underline" href="/login">Login</a></small>
					</div>
				</form>
			</main>
			<ToastContainer />
		</>
	);
}
