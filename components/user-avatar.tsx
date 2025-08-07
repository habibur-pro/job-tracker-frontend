"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'

export function UserAvatar() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage 
        src={session.user.image || "/placeholder.svg?height=32&width=32&query=user+avatar"} 
        alt={session.user.name || "User"} 
      />
      <AvatarFallback>
        {session.user.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
