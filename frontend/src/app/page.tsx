"use client"

import React, { useState, useEffect } from "react"
import Chat from "./chat/page"
import Signup from "./signup/page"
import { useRouter } from "next/navigation"
import { auth } from "../utils/firebaseConfig"
import { onAuthStateChanged, signOut } from "firebase/auth"

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [view, setView] = useState<"chat" | "signup">("signup")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        setView("chat")
      } else {
        setView("signup")
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("user")
      router.push("/")
    } catch (error) {
      console.error("Error logging out: ", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 ">
      {view === "signup" ? (
        <div className="flex flex-col items-center">
          <Signup />
        </div>
      ) : (
        <div className="flex overflow-x-hidden flex-col items-center w-full">
          <Chat />
          <button
            onClick={handleLogout}
            className="m-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}

export default HomePage
