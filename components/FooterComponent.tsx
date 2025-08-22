"use client";

import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
//font
import {DM_Sans} from "next/font/google";
const DMsansFont = DM_Sans({
  subsets: ["latin"],
})


export function FooterComponent() {
  return (
    <Footer container className="bg-[#403635] text-[#FAF6F3]">
      <div className="w-full">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div>
            <FooterBrand
              href="https://flowbite.com"
              src="/LandingPageLogo.svg"
              alt="Flowbite Logo"
              name="MitraAI"
            />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <FooterTitle className ={`text-[#FAF6F3] ${DMsansFont.className}`} title="about" />
              <FooterLinkGroup col>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>MitraAI</FooterLink>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>Our Team</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle className ={`text-[#FAF6F3] ${DMsansFont.className}`} title="Follow us" />
              <FooterLinkGroup col>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>Github</FooterLink>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>Discord</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle className ={`text-[#FAF6F3] ${DMsansFont.className}`} title="Legal" />
              <FooterLinkGroup col>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>Privacy Policy</FooterLink>
                <FooterLink href="#" className ={`text-[#FAF6F3] ${DMsansFont.className}`}>Terms &amp; Conditions</FooterLink>
              </FooterLinkGroup>
            </div>
          </div>
        </div>
        <FooterDivider className="text-[#FAF6F3]"/>
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <FooterCopyright href="#" className ={`text-[#FAF6F3]${DMsansFont.className}`} by="MitraAI™" year={2025} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <FooterIcon href="#" className="text-[#FAF6F3]" icon={BsFacebook} />
            <FooterIcon href="#" className="text-[#FAF6F3]" icon={BsInstagram} />
            <FooterIcon href="#" className="text-[#FAF6F3]" icon={BsTwitter} />
            <FooterIcon href="#" className="text-[#FAF6F3]" icon={BsGithub} />
            <FooterIcon href="#" className="text-[#FAF6F3]" icon={BsDribbble} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
