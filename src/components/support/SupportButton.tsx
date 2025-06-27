
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { HeadphonesIcon } from "lucide-react";
import PlatformAdminContactForm from './PlatformAdminContactForm';

interface SupportButtonProps {
  userEmail: string;
  userName: string;
  userRole: string;
  userSchool: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showText?: boolean;
}

const SupportButton: React.FC<SupportButtonProps> = ({
  userEmail,
  userName,
  userRole,
  userSchool,
  variant = "outline",
  size = "default",
  className = "",
  showText = true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
        >
          <HeadphonesIcon className="w-4 h-4" />
          {showText && "Contact Support"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Platform Support</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PlatformAdminContactForm
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
            userSchool={userSchool}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportButton;
