"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { ReactQueryClientProvider } from "./clientQuery"
import Navbar from "./components/navigation"
import { Provider } from "react-redux"
import { useRef, useEffect } from "react"
import { AppStore, makeStore } from "@/lib/store"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <ReactQueryClientProvider>
      <Provider store={storeRef.current}>
        <html lang="en">
          <body className={inter.className}>
            <Navbar />
            <div className="p-8">{children}</div>
          </body>
        </html>
      </Provider>
    </ReactQueryClientProvider>
  )
}
