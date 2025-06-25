import React from "react";
import MadaLogo from "@/assets/transaction-modes/card-mada.svg";
import VisaLogo from "@/assets/transaction-modes/card-visa.svg";
import MastercardLogo from "@/assets/transaction-modes/card-mastercard.svg";
import CODLogo from "@/assets/transaction-modes/cod-en.svg";
import TMaraLogo from "@/assets/transaction-modes/tamara-en.svg";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Phone as PhoneIcon, MapPin as MapPinIcon } from "lucide-react";

// =============== navigation and footer links data ================
const ABOUT_LINKS = [
	{ label: "Online Delivery", href: "#" },
	{ label: "Terms & Conditions", href: "#" },
	{ label: "Blogs", href: "#" },
	{ label: "Brand", href: "#" },
];

const CUSTOMER_SERVICE_LINKS = [
	{ label: "About Us", href: "#" },
	{ label: "Privacy Policy", href: "#" },
	{ label: "Refund and Return Policy", href: "#" },
	{ label: "Career", href: "#" },
	{ label: "Contact Us", href: "#" },
];

const GAMINGS_LINKS = [
	{ label: "FAQs", href: "#" },
	{ label: "Tamara", href: "#" },
	{ label: "Return & Exchange", href: "#" },
	{ label: "Know Your Rights", href: "#" },
];

const LEGAL_LINKS = [
	{ label: "Careers", href: "#" },
	{ label: "Warranty Policy", href: "#" },
	{ label: "Sell with us", href: "#" },
	{ label: "Terms of Use", href: "#" },
	{ label: "Terms of Sale", href: "#" },
	{ label: "Privacy Policy", href: "#" },
];

// =============== social links data ================
const SOCIAL_LINKS = [
	{ label: "Facebook", href: "#", icon: Facebook },
	{ label: "Twitter", href: "#", icon: Twitter },
	{ label: "Instagram", href: "#", icon: Instagram },
	{ label: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
	return (
		<footer className="bg-gradient-to-br from-white via-slate-50 to-slate-200 text-neutral-800 border-t border-slate-200 pt-10 pb-4">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row gap-12 border-b border-slate-300 pb-8">
					{/* =============== left section: logo and contact ================ */}
					<div className="flex flex-col min-w-[250px] gap-4">
						<div className="flex items-center gap-2 mb-2">
							<Image src="/file.svg" alt="Ecommerce Logo" width={40} height={40} />
							<span className="text-2xl font-bold tracking-wide text-primary">
								ECOMMERCE
							</span>
						</div>
						<p className="font-semibold mb-1 text-primary">Wholesale</p>
						<div className="bg-slate-100 rounded-lg p-3 mb-2 flex items-center gap-3 border border-slate-200">
							<span className="text-primary">
								<PhoneIcon className="w-5 h-5" />
							</span>
							<div>
								<p className="text-xs font-bold">9AM - 10PM</p>
								<p className="text-xs">(+966) 0570315152</p>
							</div>
						</div>
						<div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3 border border-slate-200">
							<span className="text-primary">
								<MapPinIcon className="w-5 h-5" />
							</span>
							<div>
								<p className="text-xs font-bold">Find Out Store</p>
								<p className="text-xs">Store Location</p>
							</div>
						</div>
					</div>

					{/* =============== center section: navigation ================ */}
					<div className="grid grid-cols-4 gap-6 min-w-[180px] w-full">
						<div>
							<p className="font-bold mb-2 text-primary">About Us</p>
							<ul className="space-y-1 text-sm">
								{ABOUT_LINKS.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="hover:underline hover:text-primary/80 transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="font-bold mb-2 text-primary">Customer Service</p>
							<ul className="space-y-1 text-sm">
								{CUSTOMER_SERVICE_LINKS.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="hover:underline hover:text-primary/80 transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<p className="font-bold mb-2 text-primary">Gamings</p>
							<ul className="space-y-1 text-sm">
								{GAMINGS_LINKS.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="hover:underline hover:text-primary/80 transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="font-bold mb-2 text-primary">Follow Us</p>
							<div className="flex gap-3">
								{SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
									<a
										key={label}
										href={href}
										aria-label={label}
										className="hover:text-primary transition-colors"
										target="_blank"
										rel="noopener noreferrer"
									>
										<Icon className="w-6 h-6" />
									</a>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* =============== payment methods row ================ */}
				<div className="flex flex-wrap justify-center items-center gap-4 py-4 border-b border-slate-200">
					<span className="inline-block">
						<Image src={MadaLogo} alt="Mada" width={50} height={32} />
					</span>
					<span className="inline-block">
						<Image src={MastercardLogo} alt="Mastercard" width={50} height={32} />
					</span>
					<span className="inline-block">
						<Image src={VisaLogo} alt="Visa" width={50} height={32} />
					</span>
					<span className="inline-block">
						<Image src={TMaraLogo} alt="Tamara" width={50} height={32} />
					</span>
					<span className="inline-block">
						<Image src={CODLogo} alt="Cash on Delivery" width={50} height={32} />
					</span>
				</div>

				{/* =============== bottom legal and copyright ================ */}
				<div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 pt-4 gap-2">
					<p>&copy; {new Date().getFullYear()} ecommerce store. All Rights Reserved.</p>
					<div className="flex flex-wrap gap-3">
						{LEGAL_LINKS.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="hover:underline hover:text-primary/80 transition-colors"
							>
								{link.label}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
