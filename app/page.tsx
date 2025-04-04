"use client";

import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import Link from "next/link";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <Footer />
    </div>
  );
}