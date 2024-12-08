"use client";

import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import Link from "next/link";
import { ArrowUpRightIcon, StarIcon } from "lucide-react";
import React from "react";

const FooterLink = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button variant="link" asChild className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </Button>
  );
};

function App() {
  const [starsCount, setStarsCount] = React.useState(0);

  const fetchStarsCount = async () => {
    const res = await fetch("https://api.github.com/repos/mehrdadrafiee/recursive-dnd-kanban-board");
    const data = await res.json();
    setStarsCount(data.stargazers_count);
  };

  React.useEffect(() => {
    fetchStarsCount();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-around w-full p-4 items-center font-mono">
        <div>
          <Button variant="link" asChild className="text-primary h-16 w-16">
            <a href="https://github.com/mehrdadrafiee">@mehrdadrafiee</a>
          </Button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <a href="https://github.com/mehrdadrafiee/recursive-dnd-kanban-board" className="flex items-center">
              <GitHubLogoIcon className="fill-current h-4 w-4 mr-4" />
              <StarIcon fill="currentColor" className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="font-semibold">{starsCount}</span>
              <ArrowUpRightIcon className="h-4 w-4 ml-4" />
            </a>
          </Button>
        </div>
      </header>
      <main className="mx-4 flex flex-col items-center gap-6 h-[70vh]">
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

export default App;