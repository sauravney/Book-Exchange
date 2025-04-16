"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookCard } from "@/components/books/BookCard";
import { BookForm } from "@/components/books/BookForm";
import { PlusCircle, BookOpen, Loader2 } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "seeker";
};

type Book = {
  id: string;
  _id?: string;
  title: string;
  author: string;
  genre?: string;
  location: string;
  contact: string;
  ownerId: string;
  ownerName: string;
  isRented: boolean;
  coverUrl?: string;
  createdAt: Date;
};

const Dashboard = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [activeTab, setActiveTab] = useState("my-books");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token) {
      router.push("/");
      return;
    }

    const fetchUser = async () => {
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
          email: data.email,
          name: data.name,
          role: data.role,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("user");
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      const token = localStorage.getItem("user");
      if (!token || !currentUser) return;

      try {
        const res = await fetch(
          `https://bookhubb-jnsr.onrender.com/api/books/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch books");

        const data = await res.json();
        const mapped = data.map((book: any) => ({
          ...book,
          id: book._id || book.id,
        }));

        setBooks(mapped);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };

    if (currentUser?.role === "owner") {
      fetchUserBooks();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSavedBooks = async () => {
      try {
        const token = localStorage.getItem("user");
        const res = await fetch(
          `https://bookhubb-jnsr.onrender.com/api/books/saved-books/${currentUser?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch saved books");

        const data = await res.json();
        const mapped = data.map((book: any) => ({
          ...book,
          id: book._id || book.id,
        }));

        setSavedBooks(mapped);
      } catch (err) {
        console.error("❌ Error fetching saved books:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSavedBooks();
    }
  }, [currentUser]);

  const handleAddBook = (newBook: Book) => {
    setBooks((prev) => [
      ...prev,
      { ...newBook, id: newBook._id || newBook.id },
    ]);
    setShowAddBook(false);
  };

  const handleDeleteBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const handleToggleRent = (id: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, isRented: !book.isRented } : book
      )
    );
  };

  if (loading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isOwner = currentUser.role === "owner";
  const userBooks = isOwner
    ? books.filter((b) => b.ownerId === currentUser.id)
    : [];

  return (
    <div className="flex flex-col min-h-screen pl-15 pr-15">
      <Navbar />

      <main className="container py-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground ml-10">
              Welcome back, {currentUser.name}
            </p>
          </div>

          {isOwner && !showAddBook && (
            <Button
              onClick={() => setShowAddBook(true)}
              className="mt-4 md:mt-0 bg-purple-600 text-white hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
          )}
        </div>

        {showAddBook ? (
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAddBook(false)}
              className="mb-4 rounded border bg-purple-600 text-white hover:bg-purple-800 hover:text-white"
            >
              ← Back to Dashboard
            </Button>
            <BookForm currentUser={currentUser} onAddBook={handleAddBook} />
          </div>
        ) : (
          <Tabs
            defaultValue="my-books"
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 gap-4">
              {isOwner && (
                <TabsTrigger value="my-books" className="flex items-center ">
                  <BookOpen className="mr-2 h-4 w-4 " />
                  My Books
                </TabsTrigger>
              )}
              <TabsTrigger value="saved" className="flex items-center  ">
                📚 Saved Books
              </TabsTrigger>
            </TabsList>

            {isOwner && (
              <TabsContent value="my-books">
                {userBooks.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {userBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        currentUserId={currentUser.id}
                        isManageable={true}
                        onDelete={handleDeleteBook}
                        onToggleRent={handleToggleRent}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">
                      You haven't added any books yet
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Start sharing your books with the community
                    </p>
                    <Button
                      onClick={() => setShowAddBook(true)}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Book
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="saved">
              {savedBooks.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {savedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      currentUserId={currentUser.id}
                      isManageable={false}
                      isSaved={true}
                      onDelete={handleDeleteBook}
                      onToggleRent={handleToggleRent}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">No saved books</h2>
                  <p className="text-muted-foreground">
                    Browse and save books to view them here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
