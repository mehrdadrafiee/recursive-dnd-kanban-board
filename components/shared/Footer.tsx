import Link from "next/link";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    label: "Next.js",
    href: "https://nextjs.org/",
  },
  {
    label: "DnDKit",
    href: "https://dndkit.com/",
  },
  {
    label: "Tailwind CSS",
    href: "https://tailwindcss.com/",
  },
  {
    label: "Shadcn/ui",
    href: "https://ui.shadcn.com/",
  },
];

export default function Footer() {
  return (
    <footer className="mt-6 flex flex-col items-center gap-6">
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Heavily inspired by <Link className="underline text-blue-500" href="https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui">react-dnd-kit-tailwind-shadcn-ui</Link>.✨
      </p>
      <ul className="flex items-center justify-center">
        {footerLinks.map((link) => (
          <li key={link.href}>
            <Button variant="link" asChild className="scroll-m-20 text-xl font-semibold tracking-tight">
              <Link target="_blank" href={link.href}>{link.label}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </footer>
  );
}