"use client";

import React from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ArrowUpRightIcon, StarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const [starsCount, setStarsCount] = React.useState(0);

  const fetchStarsCount = async () => {
    const res = await fetch("https://api.github.com/repos/mehrdadrafiee/recursive-dnd-kanban-board");
    const data = await res.json();
    setStarsCount(data.stargazers_count);
  };

  React.useEffect(() => {
    fetchStarsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="flex justify-around p-4 items-center font-mono w-full">
      <Button variant="link" asChild>
        <a href="https://github.com/mehrdadrafiee">@mehrdadrafiee</a>
      </Button>
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
  );
}