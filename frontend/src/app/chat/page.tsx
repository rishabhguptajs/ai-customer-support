"use client"

import React, { useEffect, useState, KeyboardEvent, useRef } from "react"
import useChatbot from "../../hooks/useChatbot"
import { User } from "firebase/auth"
import { auth, firestore } from "../../utils/firebaseConfig"
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import CodeBlock from "@/components/CodeBlocks";
import { useRouter } from "next/navigation"

const Chat: React.FC = () => {
  const { message, setMessage, responses, sendMessage, loading } = useChatbot()
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<any[]>([])
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      const chatsRef = collection(firestore, "chats")
      const q = query(chatsRef, where("userId", "==", user.uid))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatData = snapshot.docs.map((doc) => doc.data())
        setChats(chatData)
      })
      return () => unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [responses])

  const handleSendMessage = async () => {
    if (isButtonDisabled || !message.trim()) return

    setIsButtonDisabled(true)
    await sendMessage()
    setIsButtonDisabled(false)

    if (user) {
      await addDoc(collection(firestore, "chats"), {
        userId: user.uid,
        message,
        timestamp: serverTimestamp(),
      })
    }

    setMessage("")
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const formatResponse = (response: string) => {
    const escapeHTML = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
  
    let formattedResponse = escapeHTML(response);
  
    formattedResponse = formattedResponse.replace(/\n/g, "<br />");
  
    formattedResponse = formattedResponse.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );
  
    formattedResponse = formattedResponse.replace(
      /(\d+\.\s[^\d]+?)(?=\n\d+\.|\n|$)/g,
      (match, p1) => {
        return `<li>${p1.trim().replace(/^\d+\.\s/, "")}</li>`;
      }
    );
  
    if (formattedResponse.includes("<li>")) {
      formattedResponse = `<ul>${formattedResponse}</ul>`;
    }
  
    formattedResponse = formattedResponse.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match, language, code) => {
        return `<CodeBlock language="${language || 'text'}" code="${escapeHTML(code.trim())}" />`;
      }
    );
  
    return formattedResponse;
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null)
      localStorage.removeItem("user")
      router.push('/')
    })
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-200">
      <div className="flex justify-end p-4 bg-gray-100">
        {user && (
          <div className="flex items-center">
            <div className="text-gray-600 mx-2">Logged in as {user.email}</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Logout
          </button>
          </div>
        )}
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-auto p-4 bg-white border-t border-gray-300 rounded-lg shadow-lg relative"
      >
        {responses.length === 0 ? (
          <div className="text-center text-gray-600">Start a conversation</div>
        ) : (
          responses.map((response, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg ${
                response.startsWith("You:") ? "bg-blue-200 self-end" : "bg-gray-100 self-start"
              }`}
            >
              {formatResponse(response).split(/<CodeBlock/).map((part, i) => {
                if (i === 0) return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                const [props, rest] = part.split('/>');
                const languageMatch = props.match(/language="(.*?)"/);
                const codeMatch = props.match(/code="(.*?)"/);
                const language = languageMatch ? languageMatch[1] : 'text';
                const code = codeMatch ? codeMatch[1] : '';
                return (
                  <React.Fragment key={i}>
                    <CodeBlock language={language} code={code} />
                    <span dangerouslySetInnerHTML={{ __html: rest }} />
                  </React.Fragment>
                );
              })}
            </div>
          ))
        )}
        {loading && (
          <div className="fixed bottom-[5.5em] right-8 flex items-center space-x-2">
            <div className="typing-dots">
              <div className="dot bg-gray-400 w-2 h-2 rounded-full animate-bounce"></div>
              <div className="dot bg-gray-400 w-2 h-2 rounded-full animate-bounce delay-150"></div>
              <div className="dot bg-gray-400 w-2 h-2 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center p-4 border-t border-gray-300 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isButtonDisabled}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat