"use client";

import { useState } from "react";
import { ContactModal } from "./ContactModal";

interface ContactLinkProps {
  children: React.ReactNode;
  className?: string;
}

export function ContactLink({ children, className }: ContactLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span
        role="button"
        onClick={() => setIsOpen(true)}
        className={`${className} cursor-pointer`}
      >
        {children}
      </span>
      <ContactModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
