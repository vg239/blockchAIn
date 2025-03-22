import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12",
        "backdrop-blur-lg bg-black/10 dark:bg-zinc-900/70 border-b border-white/10"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-2 text-white font-bold text-xl"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span>blockchAIn</span>
        </motion.div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavItem href="#features">Features</NavItem>
          <NavItem href="#about">About</NavItem>
          <NavItem href="#roadmap">Roadmap</NavItem>
          <NavItem href="#team">Team</NavItem>
          
          <Button 
            variant="gradient" 
            className="ml-4 rounded-full px-6"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mt-4 py-4 bg-zinc-900/90 backdrop-blur-lg rounded-xl overflow-hidden"
        >
          <div className="flex flex-col gap-2 px-4">
            <MobileNavItem href="#features">Features</MobileNavItem>
            <MobileNavItem href="#about">About</MobileNavItem>
            <MobileNavItem href="#roadmap">Roadmap</MobileNavItem>
            <MobileNavItem href="#team">Team</MobileNavItem>
            <Button 
              variant="gradient" 
              className="mt-4 rounded-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Get Started
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      className="text-white/80 hover:text-white transition-colors font-medium"
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.a>
  );
}

function MobileNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-white/80 hover:text-white transition-colors py-2 border-b border-white/10 font-medium"
    >
      {children}
    </a>
  );
} 