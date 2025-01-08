"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        router.push("/login"); 
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="secondary-btn" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Log Out'}
      </button>
    </>
  );
}
