import React from "react";
import { motion } from "framer-motion";
import { CardContainer, CardBody, CardItem } from "./ui/card-hover-effect";
import { Database, Shield, Zap, LineChart, Repeat, Globe } from "lucide-react";

export function FeatureCards() {
  return (
    <div className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Advanced Blockchain Features
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto px-4">
          Our platform provides cutting-edge blockchain solutions to solve real-world problems with unmatched security and scalability.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ 
  feature, 
  index 
}: { 
  feature: { 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    gradient: string;
  }; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
    >
      <CardContainer className="h-full">
        <CardBody className="h-full relative group bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 hover:border-zinc-700">
          <div className="relative z-10">
            <div className={`p-3 w-12 h-12 rounded-lg mb-5 flex items-center justify-center ${feature.gradient}`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-xl text-white mb-2">{feature.title}</h3>
            <p className="text-zinc-400 text-sm">{feature.description}</p>
          </div>

          <CardItem
            translateZ={20}
            className="w-full h-full absolute top-0 left-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
            style={{ 
              background: `linear-gradient(to bottom right, ${feature.gradient.split(" ").slice(-2).join(" ").replace("to-", "").replace("from-", "")})` 
            }}
          />
        </CardBody>
      </CardContainer>
    </motion.div>
  );
}

const features = [
  {
    icon: <Database className="h-6 w-6 text-white" />,
    title: "Distributed Storage",
    description: "Store your data across multiple nodes for enhanced reliability and redundancy.",
    gradient: "bg-gradient-to-br from-blue-600 to-blue-400"
  },
  {
    icon: <Shield className="h-6 w-6 text-white" />,
    title: "Advanced Security",
    description: "Military-grade encryption keeps your transactions and data safe from threats.",
    gradient: "bg-gradient-to-br from-purple-600 to-purple-400"
  },
  {
    icon: <Zap className="h-6 w-6 text-white" />,
    title: "Lightning Speed",
    description: "Process thousands of transactions per second with minimal latency.",
    gradient: "bg-gradient-to-br from-amber-600 to-amber-400"
  },
  {
    icon: <LineChart className="h-6 w-6 text-white" />,
    title: "Real-time Analytics",
    description: "Monitor your blockchain performance with comprehensive analytics dashboards.",
    gradient: "bg-gradient-to-br from-green-600 to-green-400"
  },
  {
    icon: <Repeat className="h-6 w-6 text-white" />,
    title: "Smart Contracts",
    description: "Automate processes with secure, reliable, and auditable smart contracts.",
    gradient: "bg-gradient-to-br from-indigo-600 to-indigo-400"
  },
  {
    icon: <Globe className="h-6 w-6 text-white" />,
    title: "Global Network",
    description: "Connect to a worldwide network of nodes for ultimate reliability and uptime.",
    gradient: "bg-gradient-to-br from-pink-600 to-pink-400"
  }
]; 