"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, ArrowRight, Users, Search, BookMarked } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react"; // Import a loader icon

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("user");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.id;

        const res = await fetch(
          `https://bookhubb-jnsr.onrender.com/api/auth/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        setCurrentUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("user");
        setCurrentUser(null);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 text-left min-h-screen sm:pl-6 sm:pr-6 md:pl-8 md:pr-8 lg:pl-10 lg:pr-10 xl:pl-12 xl:pr-12">
      {/* Main Section */}
      <main className="container flex-1 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-purple-800">
                Connect with fellow book lovers
              </h1>
              <p className="text-xl text-gray-700 max-w-lg">
                Share, exchange, and discover books in your community with
                BookWorm Hub.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-6">
              {[
                {
                  icon: <BookMarked size={24} className="text-purple-600" />,
                  title: "Share Your Books",
                  desc: "List books you're willing to share or exchange with others.",
                },
                {
                  icon: <Search size={24} className="text-purple-600" />,
                  title: "Find New Reads",
                  desc: "Discover books in your area and connect with their owners.",
                },
                {
                  icon: <Users size={24} className="text-purple-600" />,
                  title: "Build Community",
                  desc: "Connect with fellow book lovers in your local area.",
                },
              ].map(({ icon, title, desc }, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4 hidden md:block">
              <Link href="/browse">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-base px-6 py-2.5 rounded-lg shadow transition-all gap-2">
                  Browse Available Books
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Section: Auth Form */}
          <div>
            <AuthForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
