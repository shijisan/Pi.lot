"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChatContainer({ onNotify }) {
  const { id } = useParams();
  const router = useRouter();

  const [chatrooms, setChatrooms] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newChatroomName, setNewChatroomName] = useState("");
  const [editingChatroom, setEditingChatroom] = useState(null);
  const [editChatroomName, setEditChatroomName] = useState("");

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${id}/chatrooms/get`, {
          credentials: 'include'
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

  const createChatroom = async () => {
    if (!newChatroomName.trim()) {
      return onNotify("error", "Chatroom name is required");
    }

    try {
      const response = await fetch(`/api/organizations/${id}/chatrooms/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChatroomName }),
      });

      const data = await response.json();
      if (!response.ok) {
        onNotify("error", data.error || "Failed to create chatroom");
      } else {
        setChatrooms((prev) => [...prev, data.chatroom]);
        setNewChatroomName("");
        onNotify("success", "Chatroom created successfully!");
      }
    } catch (error) {
      console.error("Error creating chatroom:", error);
      onNotify("error", "Failed to create chatroom");
    }
  };

  const updateChatroom = async () => {
    if (!editingChatroom || !editChatroomName.trim()) {
      return onNotify("error", "Chatroom name is required");
    }

    try {
      const response = await fetch(`/api/organizations/${id}/chatrooms/patch/${editingChatroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editChatroomName }),
      });

      const data = await response.json();
      if (!response.ok) {
        onNotify("error", data.error || "Failed to update chatroom");
      } else {
        setChatrooms((prev) =>
          prev.map((room) =>
            room.id === editingChatroom.id ? { ...room, name: editChatroomName } : room
          )
        );
        setEditingChatroom(null);
        setEditChatroomName("");
        onNotify("success", "Chatroom updated successfully!");
      }
    } catch (error) {
      console.error("Error updating chatroom:", error);
      onNotify("error", "Failed to update chatroom");
    }
  };

  const deleteChatroom = async (chatroomId) => {
    try {
      const response = await fetch(`/api/organizations/${id}/chatrooms/delete/${chatroomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        onNotify("error", data.error || "Failed to delete chatroom");
      } else {
        setChatrooms((prev) => prev.filter((room) => room.id !== chatroomId));
        onNotify("success", "Chatroom deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      onNotify("error", "Failed to delete chatroom");
    }
  };

  return (
    <div className="chat-container flex flex-col min-h-96 h-full justify-between">
      <div className="chatrooms flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading chatrooms...</p>
        ) : chatrooms.length === 0 ? (
          <p className="text-center text-gray-500">No chatrooms available!</p>
        ) : (
          chatrooms
            .filter((chatroom) => chatroom && chatroom.name)
            .map((chatroom) => (
              <div
                key={chatroom.id}
                className="chatroom-item mb-4 p-2 rounded-lg bg-white hover:cursor-pointer shadow flex justify-between items-center hover:scale-[101%] transition-all"
              >
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() => router.push(`/chatrooms/${chatroom.id}`)}
                >
                  {chatroom.name}
                </span>
                <div className="actions flex gap-2">
                  <button
                    className="text-sm text-green-600 hover:underline"
                    onClick={() => {
                      setEditingChatroom(chatroom);
                      setEditChatroomName(chatroom.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => deleteChatroom(chatroom.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="chatroom-creation mt-4 p-4 border-t border-gray-200">
        <input
          type="text"
          value={newChatroomName}
          onChange={(e) => setNewChatroomName(e.target.value)}
          placeholder="New chatroom name"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
        <button
          onClick={createChatroom}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
        >
          Create Chatroom
        </button>
      </div>

      {editingChatroom && (
        <div className="chatroom-edit mt-4 p-4 border-t border-gray-200">
          <input
            type="text"
            value={editChatroomName}
            onChange={(e) => setEditChatroomName(e.target.value)}
            placeholder="Edit chatroom name"
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
          />
          <button
            onClick={updateChatroom}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingChatroom(null)}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}