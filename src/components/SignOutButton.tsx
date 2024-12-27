// components/SignOutButton.tsx
"use client"
import { useClerk } from '@clerk/nextjs';
import { Button } from './ui/button';
import { LogOutIcon } from 'lucide-react';

interface SignOutButtonProps {
  className: string; // Rename `styles` to `className` to follow convention
}

const SignOutButton = ({ className }: SignOutButtonProps) => {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Button className={className} onClick={handleSignOut}>
        <LogOutIcon className='mr-2 size-4' />
      Sign Out
    </Button>
  );
};

export default SignOutButton;
