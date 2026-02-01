import Footer from "@/components/Footer";
import MainHeader from "@/components/MainHeader";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import WhyMust from "@/components/WhyMust";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <MainHeader />
      <Services />
      <WhyMust />
      <Footer />
    </div>
  );
}
