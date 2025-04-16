"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import Image from "next/image";

// ✅ Props types
type BookFormProps = {
  currentUser: {
    id: string;
    name: string;
  };
  onAddBook: (book: any) => void;
};

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  contact: z.string().min(1, "Contact information is required"),
});

type BookFormValues = z.infer<typeof bookSchema>;

const genres = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Biography",
  "History",
  "Self-Help",
  "Business",
  "Children",
  "Young Adult",
  "Poetry",
  "Comics/Graphic Novels",
  "Other",
];

export function BookForm({ currentUser, onAddBook }: BookFormProps) {
  const router = useRouter();
  const { handleSubmit, register, formState, setValue, getValues } =
    useForm<BookFormValues>({
      resolver: zodResolver(bookSchema),
      defaultValues: {
        title: "",
        author: "",
        genre: "",
        location: "",
        contact: "",
      },
    });

  const onSubmit = async (data: BookFormValues) => {
    const token = localStorage.getItem("user");

    const bookWithOwner = {
      ...data,
      isRented: false,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
    };

    try {
      const response = await fetch(
        "https://bookhubb-jnsr.onrender.com/api/books", // Updated to Next.js API route
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookWithOwner),
        }
      );

      if (!response.ok) throw new Error("Failed to add book");

      const savedBook = await response.json();
      onAddBook(savedBook); // update book list in Dashboard
      router.push("/dashboard"); // Updated to Next.js `router.push`
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card className="w-full text-left max-w-lg mx-auto rounded-lg shadow-xl dark:bg-neutral-800">
      <CardHeader className="py-4">
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          <BookOpen className="inline-block mr-2 h-6 w-6 text-primary" /> Add
          New Book
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          Share your literary treasures with the community.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
              Book Title
            </Label>
            <Input
              id="title"
              placeholder="The Hitchhiker's Guide to the Galaxy"
              className="rounded-md shadow-sm focus-ring-primary"
              {...register("title")}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive">
                {formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Author */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="author"
              className="text-gray-700 dark:text-gray-300"
            >
              Author
            </Label>
            <Input
              id="author"
              placeholder="Douglas Adams"
              className="rounded-md shadow-sm focus-ring-primary"
              {...register("author")}
            />
            {formState.errors.author && (
              <p className="text-sm text-destructive">
                {formState.errors.author.message}
              </p>
            )}
          </div>

          {/* Genre */}
          <div className="grid gap-1.5">
            <Label htmlFor="genre" className="text-gray-700 dark:text-gray-300">
              Genre (Optional)
            </Label>
            <Select
              onValueChange={(value) => setValue("genre", value)}
              defaultValue={getValues("genre")}
            >
              <SelectTrigger className="w-full rounded-md shadow-sm focus-ring-primary">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-md dark:bg-neutral-900 dark:text-gray-100">
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="location"
              className="text-gray-700 dark:text-gray-300"
            >
              Location/City
            </Label>
            <Input
              id="location"
              placeholder="Bengaluru"
              className="rounded-md shadow-sm focus-ring-primary"
              {...register("location")}
            />
            {formState.errors.location && (
              <p className="text-sm text-destructive">
                {formState.errors.location.message}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="contact"
              className="text-gray-700 dark:text-gray-300"
            >
              Contact Information
            </Label>
            <Input
              id="contact"
              placeholder="john.doe@example.com or +919876543210"
              className="rounded-md shadow-sm focus-ring-primary"
              {...register("contact")}
            />
            <p className="text-xs text-muted-foreground">
              This will be visible to others. Enter an email or phone number.
            </p>
            {formState.errors.contact && (
              <p className="text-sm text-destructive">
                {formState.errors.contact.message}
              </p>
            )}
          </div>

          {/* Cover URL */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="coverUrl"
              className="text-gray-700 dark:text-gray-300"
            >
              Book Cover URL (Optional)
            </Label>
            <Input
              id="coverUrl"
              placeholder="https://images.example.com/cover.jpg"
              className="rounded-md shadow-sm focus-ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image of the book cover.
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full rounded-md shadow-md bg-purple-600 text-white hover:bg-purple-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Add Book
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
