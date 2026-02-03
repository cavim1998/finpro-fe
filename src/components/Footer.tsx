import {
    FaFacebookF,
    FaTwitter,
    FaYoutube,
    FaInstagram,
    FaWhatsapp,
    FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-[#eef2f4] text-gray-600">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Brand */}
                <div>
                    <h1 className='text-4xl font-bold text-[#1dacbc]'>
                        LAUNDRYQ
                    </h1>
                    <p className="italic text-gray-500 mt-1 text-lg">
                        Laundry Express
                    </p>

                    <p className="mt-4 text-sm leading-relaxed">
                        <span className="font-semibold">LaundryQ Laundry Express</span> is a
                        professional laundry service offering both per-kilogram and
                        individual item washing. We are a dedicated team committed to
                        delivering high-quality laundry and excellent service based on
                        clean, neat, fresh, hygienic, and punctual principles.
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-4 mt-6">
                        {[
                            <FaFacebookF />,
                            <FaTwitter />,
                            <FaYoutube />,
                            <FaInstagram />,
                        ].map((Icon, idx) => (
                            <div
                                key={idx}
                                className="w-10 h-10 rounded-full bg-[#1dacbc] text-white flex items-center justify-center hover:bg-[#14939e] transition"
                            >
                                {Icon}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu */}
                <div>
                    <h3 className="text-[#1dacbc] font-semibold mb-4">Menu</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="hover:text-[#1dacbc] cursor-pointer">Home</li>
                        <li className="hover:text-[#1dacbc] cursor-pointer">About Us</li>
                        <li className="hover:text-[#1dacbc] cursor-pointer">Outlets</li>
                        <li className="hover:text-[#1dacbc] cursor-pointer">
                            Check Laundry Status
                        </li>
                        <li className="hover:text-[#1dacbc] cursor-pointer">
                            Terms & Conditions
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-[#1dacbc] font-semibold mb-4">Contact</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                            <FaWhatsapp className="text-[#1dacbc]" />
                            <span>0811-2233-4455</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaPhoneAlt className="text-[#1dacbc]" />
                            <span>0811-2233-4455</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#1dacbc] text-white text-sm py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
                    <span>Copyright © LaundryQ 2026</span>
                    <span className="flex items-center gap-2">
                        Managed by
                        <span className="font-semibold">PWD</span>
                    </span>
                </div>
            </div>
        </footer>
    );
}
