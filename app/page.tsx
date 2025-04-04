"use client";

import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import Link from "next/link";
import React from "react";
import Header from "@/components/Header";

const FooterLink = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button variant="link" asChild className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </Button>
  );
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center gap-6 h-[70vh]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Recursively Generated Drag and Drop Kanban Board
        </h1>
        <KanbanBoard />
      </main>
      <footer className="mt-6 flex flex-col items-center gap-6">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Heavily inspired by <Link className="underline text-blue-500" href="https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui">react-dnd-kit-tailwind-shadcn-ui</Link>.✨
        </p>
        <ul className="flex items-center justify-center">
          <li>
            <FooterLink>
              <a href="https://nextjs.org/">Next.js</a>
            </FooterLink>
          </li>
          <li>
            <FooterLink>
              <a href="https://dndkit.com">DnDKit</a>
            </FooterLink>
          </li>
          <li>
            <FooterLink>
              <a href="https://tailwindcss.com/">Tailwind CSS</a>
            </FooterLink>
          </li>
          <li>
            <FooterLink>
              <a href="https://ui.shadcn.com/">Shadcn/ui</a>
            </FooterLink>
          </li>
        </ul>
      </footer>
    </div>
  );
}