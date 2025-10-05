"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt", username, password);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="bg-image-container">
        <Image
          src="/logo.png"
          alt="Arkmail Branding"
          fill
          className="object-contain transform scale-80"
          priority
          sizes="100vw"
          quality={100}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Arkmail
              </h1>
              <p className="text-white/70 text-sm mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full burgundy-gradient py-3 rounded-lg text-white font-medium transition-all duration-300 shadow-md"
              >
                Sign In
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-white/70 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-white font-medium hover:text-burgundy-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}