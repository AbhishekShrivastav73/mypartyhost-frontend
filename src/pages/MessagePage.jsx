import React, { useEffect, useState, useRef } from "react";
import "../asset/css/MessagePage.css";
import { FaSearch, FaCheckDouble, FaTimes } from "react-icons/fa";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import BASE_URLS from "../config";
import io from "socket.io-client";

const ENDPOINT = "https://mypartyhost.onrender.com";
let socket;

const MessagePage = () => {
  const selectedChatCompare = useRef();
  const chatBodyRef = useRef(null); // Reference for chat body div
  const { user, setUser, selectedChat, setSelectedChat, chats, setChats,notifications, setNotifications } =
    ChatState();
  const [search, setSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [groupSearchResult, setGroupSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const [loggedUser, setLoggedUser] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);

  // Scroll to bottom when messages or selectedChat changes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  useEffect(() => {
    if (!user) return;
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch users for main search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResult([]);
      return;
    }
    axios
      .get(`${BASE_URLS.BACKEND_BASEURL}user/search?username=${search}`)
      .then((res) => {
        setSearchResult(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [search]);

  // Fetch users for group search
  useEffect(() => {
    if (!groupSearch.trim()) {
      setGroupSearchResult([]);
      return;
    }
    axios
      .get(`${BASE_URLS.BACKEND_BASEURL}user/search?username=${groupSearch}`)
      .then((res) => {
        setGroupSearchResult(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [groupSearch]);

  // Fetch chats on mount
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    axios
      .get(`${BASE_URLS.BACKEND_BASEURL}chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setChats(res.data);
        setSelectedChat(res.data[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  function fetchMessage() {
    if (!selectedChat?._id) return;
    setLoading(true);
    axios
      .get(`${BASE_URLS.BACKEND_BASEURL}message/${selectedChat._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        // Sort messages by createdAt in ascending order
        const sortedMessages = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
        setLoading(false);
        // Emit join chat event to socket server
        socket.emit("join chat", selectedChat._id);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setLoading(false);
      });
  }

  // Fetch messages for selected chat
  useEffect(() => {
    fetchMessage();
    selectedChatCompare.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (newMessageReceived) => {
      if (
        !selectedChatCompare.current ||
        selectedChatCompare.current._id !== newMessageReceived.chat._id
      ) {
        if(!notifications.includes(newMessageReceived)) {
          setNotifications((prev) => [newMessageReceived, ...prev]);
          setFetchAgain(!fetchAgain)
        }
      }
      setMessages((prev) => [...prev, newMessageReceived]);
    };

    socket.on("message received", handleMessage);

    return () => {
      socket.off("message received", handleMessage);
    };
  }, [selectedChat]);
console.log(notifications, '_------_-_---_-_')
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${BASE_URLS.BACKEND_BASEURL}chat`,
        { userId },
        config
      );
      setChats((prevChats) => {
        const existingChat = prevChats.find((chat) => chat._id === data._id);
        if (existingChat) {
          return prevChats;
        }
        return [data, ...prevChats];
      });
      setSelectedChat(data);
      

      await axios.put(
        `${BASE_URLS.BACKEND_BASEURL}message/read/${data._id}`,
        {},
        config
      );
  
      // Clear notifications for this chat
      setNotifications((prev) =>
        prev.filter((notification) => notification.chat._id !== data._id)
      );

      setLoadingChat(false);
    } catch (error) {
      console.error("Error accessing chat:", error);
      setLoadingChat(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      alert("Please enter a group name and select at least one user.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `http://localhost:4000/api/chat/group`,
        {
          name: groupName,
          users: selectedUsers.map((u) => u._id),
        },
        config
      );
      setChats((prevChats) => [data, ...prevChats]);
      setSelectedChat(data);
      setShowPopup(false);
      setGroupName("");
      setSelectedUsers([]);
      setGroupSearch("");
      setGroupSearchResult([]);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?._id) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `http://localhost:4000/api/message`,
        {
          chatId: selectedChat._id,
          content: newMessage,
        },
        config
      );
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, latestMessage: data }
            : chat
        )
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    setGroupName("");
    setSelectedUsers([]);
    setGroupSearch("");
    setGroupSearchResult([]);
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const getChatName = () => {
    if (!selectedChat) return "Select a chat";
    return selectedChat.isGroupChat
      ? selectedChat.chatName
      : selectedChat.users[0]._id === user._id
      ? selectedChat.users[1].name
      : selectedChat.users[0].name;
  };

  return (
    <div className="kaab-message-page relative">
      <div className="kaab-sidebar relative">
        {/* Search Functionality */}
        <div className="kaab-search relative">
          <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search name"
          />
          <button>
            <FaSearch />
          </button>
          <div
            className={`${
              searchResult.length > 0 ? "block" : "hidden"
            } absolute top-12 z-10 left-0 w-full bg-white shadow-lg rounded-lg p-4`}
          >
            {searchResult.map((user) => (
              <div
                onClick={() => accessChat(user._id)}
                className="flex cursor-pointer items-center px-3 py-2 rounded-lg bg-white shadow-md"
                key={user._id}
              >
                <img
                  src={
                    user.profileImage ||
                    "https://imgs.search.brave.com/sHfS5WDNtJlI9C_CT2YL2723HttEALNRtpekulPAD9Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzMzLzU0Lzc4/LzM2MF9GXzYzMzU0/Nzg0Ml9BdWdZemV4/VHBNSjl6MVljcFRL/VUJvcUJGMENVQ2sx/MC5qcGc"
                  }
                  className="h-10 w-10 rounded-full"
                  alt={user.name}
                />
                <div className="ml-4">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-gray-700">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kaab-messages-title">
          <p>Messages</p>
          <button
            onClick={togglePopup}
            className="text-sm text-[#3D3D3D] font-bold bg-[#ECECEC] px-3 py-1 rounded-lg"
          >
            Create Group
          </button>
        </div>
        <div className="kaab-message-list">
          {chats && chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`kaab-message-item ${
                  selectedChat && selectedChat._id === chat._id ? "active" : ""
                }`}
              >
                <img
                  src={
                    chat.isGroupChat
                      ? "https://imgs.search.brave.com/IlEhT8Dcgu3T4mm7t9xhl6UsFEooWIWZ3wDtgeDtZsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDAv/NTUwLzUzNS9zbWFs/bC91c2VyX2ljb25f/MDA3LmpwZw"
                      : chat.users[0]._id === user._id
                      ? chat.users[1].profileImage
                      : chat.users[0].profileImage
                  }
                  alt={
                    chat.isGroupChat
                      ? chat.chatName
                      : chat.users[0]._id === user._id
                      ? chat.users[1].name
                      : chat.users[0].name
                  }
                />
                <div className="kaab-message-info">
                  <div className="kaab-message-name-time">
                    <span>
                      {chat.isGroupChat
                        ? chat.chatName
                        : chat.users[0]._id === user._id
                        ? chat.users[1].name
                        : chat.users[0].name}
                    </span>
                    <span>
                      {chat.updatedAt
                        ? new Date(chat.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Time not available"}
                    </span>
                  </div>
                  <div className="kaab-message-preview">
                    {chat.latestMessage?.content.length > 18
                      ? `${chat.latestMessage?.content.slice(0, 18)}...`
                      : chat.latestMessage?.content}
                  </div>
                </div>
                {notifications.find((n) => n.chat?._id === chat._id) && (
                  <span className="kaab-unread-count">{notifications.filter((n) => n.chat?._id === chat._id).length}</span>
                )}
              </div>
            ))
          ) : (
            <div className="kaab-no-messages">
              <img src="/images/no-messages.png" alt="No Messages" />
              <p>No messages found</p>
            </div>
          )}
        </div>
      </div>

      <div className="kaab-chat-panel z-1">
        <div className="kaab-chat-header">
          <div className="kaab-chat-title capitalize">{getChatName()}</div>
          <div className="kaab-chat-subtitle">
            {selectedChat?.isGroupChat
              ? "Group Chat"
              : "Exclusive Beach Party – Energetic Hostess Required"}
          </div>
        </div>
        <div className="kaab-chat-body" ref={chatBodyRef}>
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message._id}
                className={`kaab-chat-message ${
                  message.sender._id === user?._id ? "sender" : "receiver"
                }`}
              >
                <img
                  src={
                    message.sender.profileImage || "/images/default-user.png"
                  }
                  alt={message.sender.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="kaab-chat-name-time">
                    {message.sender.name || "Unknown User"}
                    <span>
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="kaab-chat-text">{message.content || ""}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              No messages in this chat
            </div>
          )}
        </div>
        {selectedChat && (
          <div className="kaab-chat-input">
            <input
              type="text"
              placeholder="Type your message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>
              <img src="/images/send.png" alt="send" />
            </button>
          </div>
        )}
      </div>

      {/* Popup for Creating Group */}
      {showPopup && (
        <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="w-1/3 p-6 rounded-lg bg-white shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Group</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter group name"
              />
            </div>
           
            <div className="mb-4">
            { selectedUsers && selectedUsers.length > 0 && (
              <>
             
              <label className="block text-sm font-medium text-gray-700">
                Selected Users
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center bg-zinc-100 px-2 py-1 rounded-lg"
                  >
                    <span className="text-sm">{user.name}</span>
                    <FaTimes
                      className="ml-2 cursor-pointer text-red-500"
                      onClick={() => removeUser(user._id)}
                    />
                  </div>
                ))}
              </div>
              </>
            )}
           
              <label className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <input
                type="text"
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Search users to add"
              />
              <div className="mt-2 max-h-40 overflow-y-auto">
                {groupSearchResult.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center p-2 cursor-pointer rounded-lg ${
                      selectedUsers.find((u) => u._id === user._id)
                        ? "bg-blue-100"
                        : "bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.find((u) => u._id === user._id)}
                      readOnly
                      className="mr-2"
                    />
                    <img
                      src={user.profileImage || "/images/default-user.png"}
                      className="h-8 w-8 rounded-full"
                      alt={user.name}
                    />
                    <div className="ml-3">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-gray-700 text-sm">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={togglePopup}
                className="px-4 py-2 mr-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-gradient-to-l from-pink-600 to-rose-600  text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
