"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchData } from "./api/fetchData";
import {
  ChevronLeft, ChevronRight, Plus, Search, Settings, Menu,
  Clock, MapPin, Users, Calendar, Pause, Sparkles, X,
  BarChart2, Inbox, FileText, Send, Archive, Trash2, Star,
} from "lucide-react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePage, setActivePage] = useState("inbox"); // Default page
  const [emails, setEmails] = useState([]); // Store fetched emails
  const [newsletters, setNewsletters] = useState([]); // Store fetched newsletters
  const [emailActivity, setEmailActivity] = useState({ openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0 });

  useEffect(() => {
    setIsLoaded(true);

    // Fetch initial email data
    const loadEmails = async () => {
      const inboxEmails = await fetchData("emails");
      setEmails(inboxEmails);
    };

    // Fetch newsletters
    const loadNewsletters = async () => {
      const newslettersData = await fetchData("newsletters");
      setNewsletters(newslettersData);
    };

    // Fetch email activity analytics
    const loadEmailActivity = async () => {
      const activityData = await fetchData("email-activity");
      setEmailActivity(activityData);
    };

    loadEmails();
    loadNewsletters();
    loadEmailActivity();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64F5502D-D3B7-4D38-9542-B7B6A829B396-ENJk5YFoodoqkBcGJkaK84WmFvX0qr.jpeg"
        alt="Parisian apartment sketch with Eiffel Tower view"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-bold dripping-text tracking-wide relative">
            PDGmail
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
          <input type="text" placeholder="Search" className="rounded-full bg-white/10 pl-10 pr-4 py-2 text-white" />
          <Settings className="h-6 w-6 text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.4s" }}>
          <button className="mb-6 flex items-center justify-center gap-2 rounded-full burgundy-gradient hover:bg-opacity-80 transition-all duration-300 px-4 py-3 text-white w-full font-medium">
            <Plus className="h-5 w-5" />
            <span>Compose</span>
          </button>

          {/* Navigation Pages */}
          <div className="space-y-1 mb-6">
            <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors text-left bg-white/10">
              <Inbox className="h-5 w-5" />
              <span>Inbox ({emails.length})</span>
            </button>
            <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors text-left hover:bg-white/10">
              <FileText className="h-5 w-5" />
              <span>Newsletters ({newsletters.length})</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col opacity-0" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white bg-burgundy-500/20 px-4 py-1 rounded-full">
              Email Activity
            </h2>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-6">Emailing Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-medium mb-3">Open Rate</h3>
                <span className="text-3xl font-bold text-white">{emailActivity.openRate}%</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-medium mb-3">Click Rate</h3>
                <span className="text-3xl font-bold text-white">{emailActivity.clickRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
