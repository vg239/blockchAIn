import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function CTASection() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden p-1"
        >
          {/* Gradient border animation */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient"
          ></div>
          
          <div className="relative bg-zinc-900 rounded-xl py-16 px-6 md:px-12 text-center z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Join thousands of developers who are already building the next generation of decentralized applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="lg" className="rounded-full px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-zinc-700 text-white">
                Schedule Demo
              </Button>
            </div>
            
            {/* Floating orbs */}
            <motion.div 
              className="absolute top-4 right-8 w-20 h-20 rounded-full bg-blue-500/10 blur-xl"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-8 left-12 w-16 h-16 rounded-full bg-purple-500/10 blur-xl"
              animate={{ 
                y: [0, 10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 