import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MatchList from "@/components/MatchList";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-60px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-5xl mx-auto py-6 px-4 md:px-8">
            <MatchList />
          </div>
        </main>
      </div>
    </div>
  );
}
