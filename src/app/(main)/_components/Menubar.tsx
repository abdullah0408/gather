import { Button } from '@/components/ui/button'
import { Bell, Home, Bookmark } from 'lucide-react' // Add Bookmark icon for Bookmarks
import Link from 'next/link'
import React from 'react'


interface menubarProps {
    className?: string
}
const Menubar = ({className}: menubarProps) => {
  return (
    <div className={className}>
        <Button
        variant="ghost"
        className='flex items-center justify-start gap-3'
        title='Home'
        asChild
        >
            <Link href="/">
            <Home />
            <span className='hidden lg:inline'>Home</span>
            </Link>
        </Button>

        <Button
        variant="ghost"
        className='flex items-center justify-start gap-3'
        title='Notifications'
        asChild
        >
            <Link href="/notifications">
            <Bell />
            <span className='hidden lg:inline'>Notifications</span>
            </Link>
        </Button>

        <Button
        variant="ghost"
        className='flex items-center justify-start gap-3'
        title='Messages'
        asChild
        >
            <Link href="/messages">
            <Bell />
            <span className='hidden lg:inline'>Messages</span>
            </Link>
        </Button>

        <Button
        variant="ghost"
        className='flex items-center justify-start gap-3'
        title='Bookmarks'
        asChild
        >
            <Link href="/bookmarks">
            <Bookmark />
            <span className='hidden lg:inline'>Bookmarks</span>
            </Link>
        </Button>
    </div>
  )
}

export default Menubar
