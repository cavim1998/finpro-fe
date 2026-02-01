import Footer from "@/components/Footer";
import MainHeader from "@/components/MainHeader";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <MainHeader />
      <Footer />
    </div>
  );
}
