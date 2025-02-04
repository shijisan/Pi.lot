"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function ChatroomPage() {
  const { id: chatroomId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/get", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setCurrentUser({
          id: data.userId,
          fullName: data.fullName
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, sender, sender_full_name, content, created_at")
        .eq("chatroom_id", chatroomId)
        .order("created_at", { ascending: true });
      
      if (data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            senderName: msg.sender_full_name,
            created_at: msg.created_at,
          }))
        );
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel("chatroom-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [
          ...prev,
          {
            id: payload.new.id,
            content: payload.new.content,
            sender: payload.new.sender,
            senderName: payload.new.sender_full_name,
            created_at: payload.new.created_at,
          },
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatroomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase.from("messages").insert([
        {
          content: newMessage,
          sender: currentUser.id,
          sender_full_name: currentUser.fullName,
          chatroom_id: chatroomId,
        },
      ]);

      if (error) throw new Error(error.message);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <main className="chatroom-page pt-[10vh] w-full justify-center flex items-center min-h-screen">
      <div className="w-full max-w-6xl bg-blue-500 py-4 rounded-xl shadow">
        <div className="px-4 text-white flex justify-between items-center mb-2">
          <button onClick={() => router.back()} className="py-1 px-4 secondary-btn inline-flex items-center">
            <HiChevronLeft className="size-6" /> Back
          </button>
          <h1 className="text-2xl font-bold">Chatroom: {chatroomId}</h1>
        </div>

        <div className="messages-list flex flex-col bg-white h-96 overflow-y-scroll px-4">
          {messages.length === 0 ? (
            <p>No messages yet!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message p-2 ${message.sender === currentUser?.id ? "self-end text-end" : ""}`}
              >
                <p className="font-semibold text-xs">{message.senderName}</p>
                <p className="py-1 text-white px-4 bg-blue-500 w-fit rounded-full">{message.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-3 px-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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