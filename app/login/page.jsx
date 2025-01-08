"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center pt-[10vh]">
      <form className="rounded-lg bg-white border border-neutral-300 w-full max-w-sm p-4 shadow-sm" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-medium text-center text-neutral-900">Login</h1>
        <div className="flex flex-col mb-4">
          <div className="flex flex-col-reverse">
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="primary-input peer" required placeholder=" " />
            <label htmlFor="email" className="primary-input-label">Email</label>
          </div>
          <div className="flex flex-col-reverse">
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="primary-input peer" required placeholder=" " />
            <label htmlFor="password" className="primary-input-label">Password</label>
          </div>
        </div>
        <div className="flex justify-evenly items-center flex-col">
          <button type="submit" className="primary-btn w-full mb-8">Login</button>
          <small>Don't have an account yet? <a className="text-blue-600 hover:text-blue-500 underline" href="/register">Sign Up</a></small>
        </div>
      </form>
    </main>
  );
}
