"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const switchTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  };

  return (
    <Button className="cursor-pointer" variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}