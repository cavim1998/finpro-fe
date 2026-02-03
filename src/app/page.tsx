import Footer from "@/components/Footer";
import Introduction from "@/components/Introduction";
import MainHeader from "@/components/MainHeader";
import Navbar from "@/components/Navbar";
import Payments from "@/components/Payments";
import Reviews from "@/components/Reviews";
import Services from "@/components/Services";
import WhyMust from "@/components/WhyMust";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <MainHeader />
      <Services />
      <Introduction />
      <WhyMust />
      <Payments />
      <Reviews />
      <Footer />
    </div>
  );
}
