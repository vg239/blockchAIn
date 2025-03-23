import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { Dock, DockIcon } from "../components/magicui/dock";
import { ArrowDown, Brain, Coins, Home, Lock, Wallet, LogIn, LogOut, PlusCircle, User, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import "../styles/landing.css";

// Feature card component for the scrolling section
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const FeatureCard = ({ title, description, icon, delay }: FeatureCardProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
      }}
      className="superpower-card flex flex-col p-6 border border-blue-500/30 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
    >
      <div className="mb-4 p-3 bg-blue-500/20 rounded-full w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 font-playfair text-black">{title}</h3>
      <p className="text-black text-opacity-80 leading-relaxed font-inter">{description}</p>
    </motion.div>
  );
};

interface LandingPageProps {
  accountState?: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
}

export function LandingPage({ accountState = [null, () => {}] }: LandingPageProps) {
  // Use default destructuring with fallback values to avoid the "not iterable" error
  const [account, setAccount] = accountState;
  const [connecting, setConnecting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Animation states
  const [animationPhase, setAnimationPhase] = useState("empty");
  const [showDock, setShowDock] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  
  useEffect(() => {
    const timeline = async () => {
      // Start with empty screen
      setAnimationPhase("empty");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show Web2->Web3 animation
      setAnimationPhase("web2");
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAnimationPhase("arrow");
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnimationPhase("web3");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Show final text while keeping animation visible
      setAnimationPhase("final");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show dock
      setShowDock(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show features button
      setShowFeatures(true);
    };
    
    timeline();
  }, []);
  
  const handleScrollDown = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setConnecting(true);
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="landing-container relative">
      {/* Aurora Background for the entire page */}
      <div className="absolute inset-0 z-0">
        <AuroraBackground>
          <div className="h-full w-full"></div>
        </AuroraBackground>
      </div>
      
      {/* Dock navigation */}
      <motion.div 
        className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showDock ? 1 : 0, y: showDock ? 0 : -20 }}
        transition={{ duration: 0.5 }}
      >
        <Dock className="dock-nav">
          <DockIcon onClick={() => navigate('/')} className="dock-icon-glow cursor-pointer">
            <Home size={24} className="text-black" />
            <div className="dock-tooltip">Home</div>
          </DockIcon>
          
          <DockIcon onClick={() => navigate('/create')} className="dock-icon-glow cursor-pointer">
            <PlusCircle size={24} className="text-black" />
            <div className="dock-tooltip">Create Agent</div>
          </DockIcon>
          
          <DockIcon onClick={() => navigate('/blend')} className="dock-icon-glow cursor-pointer">
            <Coins size={24} className="text-black" />
            <div className="dock-tooltip">Web3 Blend</div>
          </DockIcon>
          
          {account ? (
            <>
              <DockIcon className="bg-white/20 cursor-default">
                <User size={18} className="text-black" />
                <span className="absolute -bottom-6 text-xs text-black whitespace-nowrap font-bold">
                  {formatAddress(account)}
                </span>
              </DockIcon>
              
              <DockIcon onClick={disconnectWallet} className="dock-icon-glow cursor-pointer">
                <LogOut size={24} className="text-black" />
                <div className="dock-tooltip">Disconnect</div>
              </DockIcon>
            </>
          ) : (
            <DockIcon 
              onClick={connectWallet} 
              className={`dock-icon-glow cursor-pointer ${connecting ? 'animate-pulse' : ''}`}
            >
              <LogIn size={24} className="text-black" />
              <div className="dock-tooltip">Connect Wallet</div>
            </DockIcon>
          )}
        </Dock>
      </motion.div>

      {/* Hero Section with Web2->Web3 Animation */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative z-10">
        {/* Web2 -> Web3 Animation */}
        <motion.div
          className="web2web3-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="web2-container">
            <motion.span 
              className={`web2-text ${animationPhase === 'web2' || animationPhase === 'arrow' || animationPhase === 'web3' || animationPhase === 'final' ? 'active' : ''}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ 
                x: animationPhase === 'web2' || animationPhase === 'arrow' || animationPhase === 'web3' || animationPhase === 'final' ? 0 : -50,
                opacity: animationPhase === 'web2' || animationPhase === 'arrow' || animationPhase === 'web3' || animationPhase === 'final' ? 1 : 0
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Web2
            </motion.span>
          </div>
          
          <motion.div 
            className="arrow-container"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: animationPhase === 'arrow' || animationPhase === 'web3' || animationPhase === 'final' ? 1 : 0,
              opacity: animationPhase === 'arrow' || animationPhase === 'web3' || animationPhase === 'final' ? 1 : 0
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ArrowRight size={50} className="animated-arrow" />
          </motion.div>
          
          <div className="web3-container">
            <motion.span 
              className={`web3-text ${animationPhase === 'web3' || animationPhase === 'final' ? 'active' : ''}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ 
                x: animationPhase === 'web3' || animationPhase === 'final' ? 0 : 50,
                opacity: animationPhase === 'web3' || animationPhase === 'final' ? 1 : 0
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Web3
            </motion.span>
          </div>
        </motion.div>

        {/* "Bringing AI on Chain" Text */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tighter font-playfair z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: animationPhase === 'final' ? 1 : 0,
            scale: animationPhase === 'final' ? 1 : 0.9,
          }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <span className="text-black bringing-text">
            Bringing AI on Chain
          </span>
        </motion.h1>

        {/* Scroll Button */}
        {showFeatures && (
          <motion.button
            onClick={handleScrollDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 text-black flex flex-col items-center cursor-pointer hover:text-black"
          >
            <span className="mb-2 text-sm font-inter font-bold text-black">Explore Superpowers</span>
            <ArrowDown size={20} className="animate-bounce" />
          </motion.button>
        )}
      </div>
      
      {/* Superpowers Section - Light themed with AuroraBackground */}
      <div ref={scrollRef} className="min-h-screen py-24 px-4 md:px-8 superpowers-section-light relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <h2 className="text-3xl md:text-6xl font-bold mb-2 font-playfair superpowers-title-light">
                <span className="super-text-light">Super</span>
                <span className="powers-text">powers</span>
              </h2>
              <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full mt-2 mb-6"></div>
            </motion.div>
            <p className="text-lg text-black max-w-3xl mx-auto font-inter">
              BlockchAIn combines AI intelligence with blockchain technology, giving your agents real superpowers in Web3.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards with updated class for light theme */}
            <FeatureCard
              title="Autonomous Transactions"
              description="AI agents with their own blockchain wallets, capable of executing transactions without human intermediaries."
              icon={<Wallet size={28} className="text-blue-400" />}
              delay={0.2}
            />
            
            <FeatureCard
              title="Personalized  Assistants"
              description="Create custom agents specialized in multiple things like, NFT management, or cross-chain operations."
              icon={<Coins size={28} className="text-blue-400" />}
              delay={0.4}
            />
            
            <FeatureCard
              title="CDP Kit and More."
              description="Agents can do all the function rovided by agent kit and more in a one stop solution on our app."
              icon={<Lock size={28} className="text-blue-400" />}
              delay={0.6}
            />
            
            <FeatureCard
              title="Smart Contract Deployment"
              description="Agents can deploy and interact with smart contracts based on your instructions."
              icon={<Brain size={28} className="text-blue-400" />}
              delay={0.8}
            />
            
            <FeatureCard
              title="Custom zK-Snarks"
              description="Agents can create custom zK-Snarks and compile them for your respective use case."
              icon={<Brain size={28} className="text-blue-400" />}
              delay={1.0}
            />
            
            <FeatureCard
              title="Web2 -> Web3"
              description="Bring your web2 app idea to web3 by bringing your agents on chain and getting suggestions from us."
              icon={<Coins size={28} className="text-blue-400" />}
              delay={1.2}
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-white/80 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-12 shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black font-playfair">Ready to Experience the Future?</h2>
          <p className="text-lg text-black text-opacity-80 mb-8 font-inter">
            Create your first AI agent with blockchain capabilities in minutes.
          </p>
          <Link to="/create">
            <Button className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 font-inter text-white">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default LandingPage;