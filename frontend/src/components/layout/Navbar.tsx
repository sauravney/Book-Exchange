"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, LogOut, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  // Decode token and set user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("user");
      if (!token) {
        setLoading(false);
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
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/");
  };

  const getUserInitials = () => {
    if (!currentUser?.name) return "?";
    const parts = currentUser.name.split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? " backdrop-blur-md shadow-sm dark:bg-gray-900/90"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {localStorage.getItem("user") ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-book-burgundy" />
              <span className="text-xl font-semibold">BookWorm Hub</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-book-burgundy" />
              <span className="text-xl font-semibold">BookWorm Hub</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Browse Books
          </Link>

          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="h-8 w-8 rounded-full bg-muted bg-purple-300 ">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-purple-500 hover:text-white transition-colors"
                  >
                    <Link
                      href="/profile"
                      className="cursor-pointer flex items-center hover:bg-purple-500"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-purple-500 hover:text-white transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              className="bg-purple-600 text-white hover:bg-purple-800"
              onClick={() => router.push("/")}
            >
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-6">
              <Link
                href="/browse"
                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Browse Books
              </Link>

              {loading ? (
                <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
              ) : currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors hover:bg-purple-500 hover:text-white transition-colors px-2 py-1 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="justify-start px-2 hover:bg-purple-500 hover:text-white transition-colors"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Log out</span>
                  </Button>
                </>
              ) : (
                <Button onClick={() => router.push("/")}>Sign In</Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
