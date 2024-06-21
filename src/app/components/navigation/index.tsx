import React from "react"
import Link from "next/link"

const Navbar = () => {
  return (
    <div className="z-10 w-full h-20 bg-emerald-800 sticky top-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          <ul className="hidden md:flex gap-x-6 text-white">
            <li>
              <Link href="/">
                <p>Main</p>
              </Link>
            </li>
            <li>
              <Link href="/tasks">
                <p>Tasks</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
