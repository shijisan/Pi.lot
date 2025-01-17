"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatroomPage() {
  const { id } = useParams(); // Extract chatroom ID from the URL
  const router = useRouter();

  const [messages, setMessages] = useState([]); // Store chatroom messages
  const [newMessage, setNewMessage] = useState(""); // Input for a new message
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chatroom messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chatrooms/${id}/messages/get`, {
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            router.push("/dashboard");
            return;
          }
          throw new Error(data.error || "Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchMessages();
  }, [id, router]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chatrooms/${id}/messages/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chatroom-page pt-[10vh]">
      <h1 className="text-2xl font-bold mb-4">Chatroom: {id}</h1>

      {isLoading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="messages-list mb-4">
          {messages.length === 0 ? (
            <p>No messages yet!</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="message p-2 border-b">
                <p className="font-semibold">{message.user}</p>
                <p>{message.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="send-message flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
