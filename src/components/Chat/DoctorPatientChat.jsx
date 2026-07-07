import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import {
  FiSend,
  FiChevronLeft,
  FiSmile,
  FiSearch,
  FiMoreVertical,
  FiPaperclip,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { socket } from "@/lib/socket";
import { UserContext } from "@/context/UserContext";
import {
  getOrCreateConversation,
  getMessages,
  getDoctorConversations,
  getSubUserConversations,
  clearConversationMessages,
} from "@/api/Chat/Chat";
import EmojiPicker from "emoji-picker-react";

export default function DoctorPatientChat() {
  const { user, selectedEntity } = useContext(UserContext);

  // Constants
  const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random&name=User";

  // Refs
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  // State
  const [connections, setConnections] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Sidebar contact search
  const [msgSearchQuery, setMsgSearchQuery] = useState(""); // Internal chat search
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Memoized current chat session
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId);
  }, [conversations, activeChatId]);

  // Filtered connections based on sidebar search
  const filteredConnections = useMemo(() => {
    return connections.filter((conn) =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [connections, searchQuery]);

  // Filtered messages based on internal chat search
  const filteredMessages = useMemo(() => {
    if (!activeChat) return [];
    if (!msgSearchQuery.trim()) return activeChat.messages;
    return activeChat.messages.filter((m) =>
      m.text.toLowerCase().includes(msgSearchQuery.toLowerCase())
    );
  }, [activeChat, msgSearchQuery]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ============================================
      1. FETCH CONNECTIONS (ROLE BASED)
  ============================================ */
  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        if (user.role === "doctor") {
          const res = await getDoctorConversations(user.id);
          setConnections(res.map((c) => c.subUser));
        } else if (user.role === "parent" && selectedEntity?.subUserId) {
          const res = await getSubUserConversations(selectedEntity.subUserId);
          console.log("Fetched connections for parent:", res);
          setConnections(res.map((c) => c.doctor));
        }
      } catch (error) {
        console.error("❌ Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user, selectedEntity]);

  /* ============================================
      2. START CONVERSATION LOGIC
  ============================================ */
  const startConversation = async (target) => {
    // Mobile: Hide sidebar when a chat is selected
    if (window.innerWidth < 768) setShowSidebar(false);
    
    // Reset message search when switching chats
    setShowMsgSearch(false);
    setMsgSearchQuery("");

    try {
      const payload =
        user.role === "doctor"
          ? { doctorId: user.id, subUserId: target.subUserId }
          : { doctorId: target.id, subUserId: selectedEntity.subUserId };

      const conversation = await getOrCreateConversation(payload);

      if (!conversation?.id) return;

      const chatObject = {
        id: conversation.id,
        doctorId: conversation.doctor?.id || payload.doctorId,
        subUserId: conversation.subUser?.subUserId || payload.subUserId,
        name: target.name,
        image: target.profileImageUrl,
        roleTitle: user.role === "doctor" ? "Patient" : target.specialty || "Doctor",
        messages: [],
      };

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);
        if (exists) return prev;
        return [chatObject, ...prev];
      });

      setActiveChatId(conversation.id);

      // Load historical messages
      const messages = await getMessages(conversation.id);
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        sender: msg.senderRole,
        text: msg.message, // Matches your incoming "message" field
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, messages: formattedMessages } : c
        )
      );
    } catch (error) {
      console.error("❌ Error starting conversation:", error);
    }
  };

  /* ============================================
      3. REAL-TIME SOCKET HANDLING
  ============================================ */
  useEffect(() => {
    if (!activeChatId) return;

    const room = `conversation-${activeChatId}`;
    socket.connect();
    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (data) => {
      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === data.conversationId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: data.id,
                    sender: data.senderRole,
                    text: data.message,
                    time: new Date(data.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ],
              }
            : chat
        )
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", room);
    };
  }, [activeChatId]);

  /* ============================================
      4. MESSAGE ACTIONS
  ============================================ */
  const sendMessage = () => {
    if (!newMessage.trim() || !activeChatId) return;

    socket.emit("sendMessage", {
      conversationId: activeChatId,
      doctorId: user.role === "doctor" ? user.id : activeChat?.doctorId,
      subUserId:
        user.role === "parent"
          ? selectedEntity?.subUserId
          : activeChat?.subUserId,
      senderRole: user.role,
      senderId: user.id,
      message: newMessage,
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleClearChat = async () => {
    if (!activeChatId) return;
    if (!window.confirm("Are you sure you want to clear all messages? This cannot be undone.")) return;

    try {
      await clearConversationMessages(activeChatId);
      // Update local state to remove messages
      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages: [] } : chat
        )
      );
      setShowMenu(false);
    } catch (error) {
      console.error("❌ Error clearing chat:", error);
      alert("Failed to clear messages. Please try again.");
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    // Only scroll if we aren't currently searching (to avoid jumping while reading search results)
    if (!msgSearchQuery) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, msgSearchQuery]);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 m-2 md:m-4">
      
      {/* --- SIDEBAR --- */}
      <aside
        className={`${
          showSidebar ? "w-full md:w-80 lg:w-96" : "hidden md:flex"
        } flex flex-col border-r border-gray-100 bg-white transition-all duration-300`}
      >
        <div className="p-5 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Chats</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              <FiMoreVertical size={20} />
            </button>
          </div>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-blue-400 text-sm transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-5 py-4 text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            {user?.role === "doctor" ? "Patient List" : "Specialist Doctors"}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Loading contacts...</p>
            </div>
          ) : filteredConnections.length > 0 ? (
            filteredConnections.map((conn) => (
              <div
                key={conn.id || conn.subUserId}
                onClick={() => startConversation(conn)}
                className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all duration-200 border-l-4
                ${
                  activeChatId === conn.id || (activeChat && (activeChat.doctorId === conn.id || activeChat.subUserId === conn.subUserId))
                    ? "bg-blue-50 border-blue-500"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <img
                    src={conn.profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${conn.name}`}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    alt={conn.name}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900 truncate text-sm">
                      {conn.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.role === "doctor" ? "Patient" : conn.specialty || "Doctor"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 px-6">
              <p className="text-sm text-gray-400">No contacts found</p>
            </div>
          )}
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main
        className={`${
          !showSidebar ? "flex" : "hidden md:flex"
        } flex-1 flex-col bg-[#F8FAFC]`}
      >
        {activeChat ? (
          <>
            <header className="flex flex-col bg-white border-b border-gray-100 z-10 shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <img
                      src={activeChat.image || `https://ui-avatars.com/api/?background=random&name=${activeChat.name}`}
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                      alt={activeChat.name}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none mb-1">
                      {activeChat.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMsgSearch(!showMsgSearch)}
                    className={`p-2 rounded-lg transition ${showMsgSearch ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}
                  >
                    <FiSearch size={18} />
                  </button>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiMoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu for Clear Chat */}
                  {showMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <button
                        onClick={handleClearChat}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={16} />
                        Clear Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Message Search Bar */}
              {showMsgSearch && (
                <div className="px-6 pb-3 animate-in slide-in-from-top-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search in this conversation..."
                      className="w-full pl-9 pr-10 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                      value={msgSearchQuery}
                      onChange={(e) => setMsgSearchQuery(e.target.value)}
                    />
                    {msgSearchQuery && (
                      <button 
                        onClick={() => setMsgSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </header>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pattern-bg">
              {filteredMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-60">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FiSend size={24} className="text-blue-300" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest">
                    {msgSearchQuery ? "No matching messages found" : "No messages yet"}
                  </p>
                </div>
              )}

              {filteredMessages.map((msg, idx) => {
                const isMe = msg.sender === user.role;
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col space-y-1 max-w-[85%] md:max-w-[70%] ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 text-sm shadow-sm transition-all duration-200
                        ${
                          isMe
                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1 font-medium">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="p-4 bg-white border-t border-gray-100 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                  <EmojiPicker onEmojiClick={onEmojiClick} height={400} width={300} />
                </div>
              )}
              
              <div className="flex items-center gap-3 max-w-6xl mx-auto">
                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1.5 flex-1 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition"
                  >
                    <FiSmile size={20} />
                  </button>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-gray-700"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-2xl shadow-lg transition-all transform active:scale-95
                  ${
                    newMessage.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* Empty View */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 animate-pulse">
               <FiSend size={48} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-800">Your Consultations</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Select a professional from the sidebar to view history or start a new conversation.
              </p>
            </div>
            {window.innerWidth < 768 && (
              <button 
                onClick={() => setShowSidebar(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                Show Contacts
              </button>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .pattern-bg {
          background-color: #f8fafc;
          background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}