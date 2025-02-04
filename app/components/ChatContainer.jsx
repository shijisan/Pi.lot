"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatContainer({ onNotify }) {
  const { id } = useParams();
  const router = useRouter();

  const [chatrooms, setChatrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${id}/chatrooms/get`, {
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            onNotify("error", "Session expired. Please login again");
            router.push("/dashboard");
            return;
          }
          onNotify("error", data.error || "Failed to fetch chatrooms");
        } else {
          const data = await response.json();
          setChatrooms(data.chatrooms || []);
        }
      } catch (error) {
        console.error("Error fetching chatrooms:", error);
        onNotify("error", "Failed to fetch chatrooms");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchChatrooms();
    }
  }, [id, router, onNotify]);

  return (
    <div className="chat-container flex flex-col h-full justify-between flex-grow">
      <div className="chatrooms flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading chatrooms...</p>
        ) : chatrooms.length === 0 ? (
          <p className="text-center text-gray-500">No chatrooms available!</p>
        ) : (
          chatrooms.map((chatroom) => (
            <div
              key={chatroom.id}
              className="chatroom-item mb-4 p-2 rounded-lg bg-white hover:cursor-pointer shadow hover:scale-[101%] transition-all"
              onClick={() => router.push(`/chatrooms/${chatroom.id}`)}
            >
              <span className="text-blue-600">{chatroom.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
