"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi";

export default function ChatroomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserFullName, setCurrentUserFullName] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/user/get", {
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            router.push("/dashboard");
            return;
          }
          throw new Error(data.error || "Failed to fetch current user ID");
        }

        const data = await response.json();
        setCurrentUserId(data.userId || null);
        setCurrentUserFullName(data.userFullName || "Unknown");
      } catch (error) {
        console.error("Error fetching current user ID:", error);
      }
    };

    fetchUserId();
  }, [router]);

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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chatrooms/${id}/messages/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      const newMessageObject = {
        id: data.message.id,
        content: newMessage,
        sender: currentUserId,
        senderFullName: currentUserFullName, 
        timestamp: data.message.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessageObject]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="chatroom-page pt-[10vh] w-full justify-center flex items-center min-h-screen">
      <div className="w-full max-w-6xl bg-blue-500 py-4 rounded-xl shadow">
        <div className="px-4 text-white flex justify-between items-center mb-2">
          <button className="py-[.25rem!important] px-4 secondary-btn inline-flex justify-center items-center" onClick={() => router.back()}>
            <HiChevronLeft className="size-6" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Chatroom: {id}</h1>
        </div>

        {isLoading ? (
          <div className="messages-list flex flex-col bg-white h-96 overflow-y-scroll justify-center items-center px-4">
            <p>Loading messages...</p>
          </div>
        ) : (
          <div className="messages-list flex flex-col bg-white h-96 overflow-y-scroll px-4">
            {messages.length === 0 ? (
              <p>No messages yet!</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message p-2 ${message.sender === currentUserId ? "self-end text-end" : ""}`}
                >
                  <p className="font-semibold text-xs">{message.senderFullName}</p>
                  <p className="py-1 text-white px-4 bg-blue-500 w-fit rounded-full">{message.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex gap-2 mt-3 px-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 py-2 px-4 border rounded-s-full"
          />
          <button onClick={sendMessage} className="secondary-btn rounded-s-none">
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
