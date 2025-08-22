"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
//font
import {DM_Sans} from "next/font/google";

const DMsansFont = DM_Sans({
  subsets: ["latin"],
})

const navItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/docs" },
  { name: "Contact", href: "/showcase" },
];



export function LandingNavbar() {
  const pathname = usePathname();

  return (
      <div className="navbar bg-transparent sticky top-0 z-50 w-full">
        <div className="navbar-start">
            <Link href="/" className="text-xl font-semibold tracking-tight">
               <h3 className={`${DMsansFont.className} text-[#403635] text-xl`}>MitraAI</h3>
            </Link> 
        </div>
        <div className={` ${DMsansFont.className} navbar-center text-5xl`}>
            <Card className="relative rounded-full bg-white/80 dark:bg-[#3B3D40]/90 shadow-md border border-[#F6D8D6]/50 dark:border-[#403635]/50 px-6 py-2">
                <CardContent className="flex gap-6 items-center justify-center p-0">
                    {navItems.map(({ name, href }) => (
                    <Link
                        key={name}
                        href={href}
                        className={cn(
                        "text-sm font-medium transition-colors hover:text-[#912F40]",
                        pathname === href ? "text-[#912F40] dark:text-[#912F40]" : "text-[#403635] dark:text-[#F6D8D6]"
                        )}
                    >
                        {pathname === href && <span className="mr-1 text-[#912F40]">•</span>}
                        {name}
                    </Link>
                    ))}
                </CardContent>

                <BorderBeam
                    duration={6}
                    size={400}
                    className="from-transparent via-[#912F40] to-transparent"
                />
                <BorderBeam
                    duration={10}
                    delay={3}
                    size={600}
                    borderWidth={2}
                    className="from-transparent via-[#F6D8D6] to-transparent"
                />
            </Card>
        </div>
        <div className="navbar-end"> 
            <Button asChild><Link href="../login-in-page">Login</Link></Button>
        </div>
    </div>
  );
}

