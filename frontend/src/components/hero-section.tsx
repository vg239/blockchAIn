import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full pt-32 pb-20 overflow-hidden">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement
          icon={<div className="w-4 h-4 rounded-full bg-blue-500" />}
          x={-15}
          y={-20}
          delay={0}
        />
        <FloatingElement
          icon={<div className="w-3 h-3 rounded-full bg-purple-500" />}
          x={25}
          y={-10}
          delay={0.5}
        />
        <FloatingElement
          icon={<div className="w-5 h-5 rounded-full bg-indigo-400" />}
          x={-20}
          y={25}
          delay={1}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-white rounded-full bg-zinc-800/50 border border-zinc-700">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>Revolutionizing blockchain technology</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-4xl px-4 md:px-8"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          The Future of{" "}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Blockchain
          </span>{" "}
          Technology
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10">
          Seamlessly integrate blockchain solutions with our powerful API. 
          Build secure, scalable applications with unprecedented ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <Button variant="gradient" size="lg" className="rounded-full">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full border-zinc-700 text-white">
            View Documentation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Feature card component
function FeatureCard({ title, description, index }: { title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (index * 0.1), duration: 0.6 }}
      className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-800/30"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 mt-1 text-blue-500" />
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Floating element component for decoration
function FloatingElement({ 
  icon, 
  x, 
  y, 
  delay 
}: { 
  icon: React.ReactNode; 
  x: number; 
  y: number; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 0.7,
        x: [0, x, 0],
        y: [0, y, 0],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      {icon}
    </motion.div>
  );
}

const features = [
  {
    title: "Secure",
    description: "End-to-end encryption for all your data and transactions."
  },
  {
    title: "Fast",
    description: "Lightning-fast transactions with minimal gas fees."
  },
  {
    title: "Scalable",
    description: "Easily scales to millions of users without performance loss."
  }
]; 