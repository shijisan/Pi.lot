"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ManageOrgSideBar from "@/app/components/ManageOrgSideBar";

export default function ManageChatrooms() {
  const { id } = useParams();
  const router = useRouter();

  // State management
  const [chatrooms, setChatrooms] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingChatroom, setEditingChatroom] = useState(null);
  const [newChatroomData, setNewChatroomData] = useState({
    name: "",
    description: "",
    labelAccess: {},
  });

  // Fetch chatrooms and labels data
  useEffect(() => {
    const fetchChatroomData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${id}/chatrooms/get`, {
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          console.error("Error fetching data:", data);
          if (response.status === 401) {
            toast.error("Session expired. Please login again");
            router.push("/dashboard");
            return;
          }
          throw new Error(data.error || "Failed to fetch data");
        }

        const data = await response.json();
        console.log("Fetched data:", data);
        setChatrooms(data.chatrooms || []);
        setLabels(data.labels || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchChatroomData();
    }
  }, [id, router]);

  // Handle label access toggle for new chatroom
  const handleLabelAccessToggle = (labelId, accessType) => {
    setNewChatroomData((prev) => ({
      ...prev,
      labelAccess: {
        ...prev.labelAccess,
        [labelId]: {
          ...prev.labelAccess[labelId],
          [accessType]: !prev.labelAccess[labelId]?.[accessType],
        },
      },
    }));
  };

  // Handle label access toggle for editing chatroom
  const handleEditLabelAccess = (labelId, accessType) => {
    setEditingChatroom((prev) => ({
      ...prev,
      labelAccess: {
        ...prev.labelAccess,
        [labelId]: {
          ...prev.labelAccess[labelId],
          [accessType]: !prev.labelAccess[labelId]?.[accessType],
        },
      },
    }));
  };

  // Create new chatroom
  const createChatroom = async () => {
    const { name, description, labelAccess } = newChatroomData;

    if (!name.trim()) {
      return toast.error("Chatroom name is required");
    }

    const labelAccessArray = Object.entries(labelAccess)
      .filter(([_, access]) => access.canRead || access.canWrite)
      .map(([labelId, access]) => ({
        labelId,
        canRead: Boolean(access.canRead),
        canWrite: Boolean(access.canWrite),
      }));

    if (labelAccessArray.length === 0) {
      return toast.error("At least one label must have read or write access");
    }

    try {
      const response = await fetch(`/api/organizations/${id}/chatrooms/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          labelAccess: labelAccessArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create chatroom");
      }

      const data = await response.json();
      setChatrooms((prev) => [...prev, data.chatroom]);
      setNewChatroomData({
        name: "",
        description: "",
        labelAccess: {},
      });
      toast.success("Chatroom created successfully!");
    } catch (error) {
      console.error("Error creating chatroom:", error);
      toast.error(error.message || "Failed to create chatroom");
    }
  };

  // Edit existing chatroom
  const handleEditChatroom = async () => {
    if (!editingChatroom) return;

    if (!editingChatroom.name.trim()) {
      return toast.error("Chatroom name is required");
    }

    const labelAccessArray = Object.entries(editingChatroom.labelAccess)
      .filter(([_, access]) => access.canRead || access.canWrite)
      .map(([labelId, access]) => ({
        labelId,
        canRead: Boolean(access.canRead),
        canWrite: Boolean(access.canWrite),
      }));

    if (labelAccessArray.length === 0) {
      return toast.error("At least one label must have read or write access");
    }

    try {
      const response = await fetch(
        `/api/organizations/${id}/chatrooms/${editingChatroom.id}/patch`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: editingChatroom.name,
            description: editingChatroom.description,
            labelAccess: labelAccessArray,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update chatroom");
      }

      const data = await response.json();
      setChatrooms((prev) =>
        prev.map((room) =>
          room.id === editingChatroom.id ? data.chatroom : room
        )
      );
      setEditingChatroom(null);
      toast.success("Chatroom updated successfully!");
    } catch (error) {
      console.error("Error updating chatroom:", error);
      toast.error(error.message || "Failed to update chatroom");
    }
  };

  // Delete chatroom
  const handleDeleteChatroom = async (chatroomId) => {
    if (!window.confirm("Are you sure you want to delete this chatroom?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/organizations/${id}/chatrooms/delete/${chatroomId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete chatroom");
      }

      setChatrooms((prev) =>
        prev.filter((chatroom) => chatroom.id !== chatroomId)
      );
      toast.success("Chatroom deleted successfully!");
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      toast.error(error.message || "Failed to delete chatroom");
    }
  };

  // UI Components
  const renderLabelAccessControls = (currentLabels, onChange) => {
    // Ensure currentLabels is an object
    const safeCurrentLabels = currentLabels && typeof currentLabels === 'object' ? currentLabels : {};
  
    return labels.map((label) => {
      // Ensure labelAccess is always defined
      const labelAccess = safeCurrentLabels[label.id] || { canRead: false, canWrite: false };
  
      return (
        <div
          key={label.id}
          className="flex items-center justify-between p-2 border rounded mb-2"
        >
          <span className="font-medium">{label.name}</span>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelAccess.canRead}
                onChange={() => onChange(label.id, "canRead")}
                className="mr-2"
              />
              Read
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelAccess.canWrite}
                onChange={() => onChange(label.id, "canWrite")}
                className="mr-2"
              />
              Write
            </label>
          </div>
        </div>
      );
    });
  };
  
  

  return (
    <main className="flex flex-col w-full items-center">
      <div className="max-w-6xl flex flex-row w-full min-h-screen">
        <ManageOrgSideBar />
        <div className="w-full min-h-screen pt-[10vh] px-4 pb-4 border border-neutral-300 bg-white flex flex-col">
          <h1 className="text-2xl font-bold mb-6">Manage Chatrooms</h1>

          {/* Create Chatroom Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Chatroom</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Chatroom Name"
                value={newChatroomData.name}
                onChange={(e) =>
                  setNewChatroomData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description (Optional)"
                value={newChatroomData.description}
                onChange={(e) =>
                  setNewChatroomData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Label Access Control</h3>
                {labels.length === 0 ? (
                  <p className="text-gray-600">
                    No labels available. Please create labels first.
                  </p>
                ) : (
                  renderLabelAccessControls(
                    newChatroomData.labelAccess,
                    handleLabelAccessToggle
                  )
                )}
              </div>

              <button
                onClick={createChatroom}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Create Chatroom
              </button>
            </div>
          </div>

          {/* Chatrooms List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing Chatrooms</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading chatrooms...</div>
            ) : chatrooms.length === 0 ? (
              <p className="text-gray-600 py-4">
                No chatrooms available. Create one to get started.
              </p>
            ) : (
              chatrooms.map((chatroom) => (
                <div
                  key={chatroom.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  {editingChatroom?.id === chatroom.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingChatroom.name}
                        onChange={(e) =>
                          setEditingChatroom((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        value={editingChatroom.description}
                        onChange={(e) =>
                          setEditingChatroom((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded"
                        rows="3"
                      />
                      <div className="space-y-2">
                        <h4 className="font-medium">Label Access:</h4>
                        {renderLabelAccessControls(
                          editingChatroom.labelAccess,
                          handleEditLabelAccess
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditChatroom}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingChatroom(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{chatroom.name}</h3>
                        <p className="text-gray-600 mt-1">
                          {chatroom.description || "No description"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingChatroom(chatroom)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChatroom(chatroom.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}