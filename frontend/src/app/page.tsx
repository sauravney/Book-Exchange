import HomePage from "../components/home/page";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main className="flex-grow">
        <HomePage />
      </main>
    </div>
  );
}
