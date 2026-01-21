import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedListDemo } from "../AnimatedListDemo";
import { Link } from "react-router-dom";
import GetStarted from "../ui/GetStarted";
import TextType from '../ui/TextType';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src: string;
        background: string;
        speed: string;
        loop?: boolean;
        autoplay?: boolean;
      }, HTMLElement>;
    }
  }
}

// Initial Landing Screen Component - White themed to match the main interface
function InitialLanding() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingScript = document.querySelector('script[src*="dotlottie-player"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs";
    script.type = "module";
    document.body.appendChild(script);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Lottie Animation with Glow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            ref={containerRef}
            className="flex items-center justify-center relative"
          >
            {/* Glowing emerald gradient background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-[90%] h-[90%] rounded-full bg-gradient-to-br from-emerald-400/40 via-emerald-500/30 to-emerald-600/40 blur-3xl"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            {/* Lottie Player */}
            <div className="w-full max-w-lg relative z-10">
              <dotlottie-player
                src="https://lottie.host/7bb825d1-db9f-4d2a-b702-2ee182115348/Pqln7rcdtT.lottie"
                background="transparent"
                speed="1"
                style={{ width: "100%", height: "100%" }}
                loop
                autoplay
              />
            </div>
          </motion.div>

          {/* Right Side - Typing Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          >
            {/* Main Heading with Typing Effect */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                <TextType
                  text={[
                    "Welcome to",
                    "Srdev Corp",
                    "(Sachin Yadav)"
                  ]}
                  typingSpeed={100}
                  deletingSpeed={60}
                  pauseDuration={1200}
                  showCursor={true}
                  cursorCharacter="|"
                  cursorBlinkDuration={0.7}
                />
              </h1>

              {/* Subtitle */}
              <div className="text-xl md:text-2xl lg:text-3xl text-gray-700 space-y-4">
                <p className="font-light">
                  Proudly Presenting{" "}
                  <span className="font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    SplitXo
                  </span>
                </p>
                <p className="text-lg md:text-xl text-gray-600 font-medium">
                  The Modern Way to Manage Shared Expenses
                </p>
              </div>

              {/* Description with second typing effect */}
              <div className="text-base md:text-lg text-gray-500 mt-6">
                <TextType
                  text={[
                    "Split bills instantly with friends and family...",
                    "Track every transaction with complete transparency...",
                    "Settle up in seconds with smart calculations...",
                    "Never lose track of who owes what again!"
                  ]}
                  typingSpeed={75}
                  deletingSpeed={50}
                  pauseDuration={2000}
                  showCursor={true}
                  cursorCharacter="_"
                  cursorBlinkDuration={0.5}
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 border border-emerald-200"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 font-medium">Preparing your dashboard...</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Subtle background decorations - minimal to keep it clean */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-50/50 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>
    </motion.div>
  );
}

// Feature Card 1 - Expense Split
function ExpenseSplitCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-6 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 border border-gray-100"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="relative p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md">
            <svg width={20} fill="white" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>
            <svg className="absolute -bottom-1 -right-1 bg-black/30 rounded-full p-0.5" width={14} height={14} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </span>
          <p className="text-lg font-semibold text-gray-900">Expense Split</p>
        </div>
      </div>

      {/* Data */}
      <div className="space-y-4">
        <p className="text-2xl font-bold text-gray-900">2 Members</p>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "76%" }}
            transition={{ duration: 1.5, delay: delay + 0.3 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Feature Card 2 - Expense Tracking
function ExpenseTrackingCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-6 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 border border-gray-100"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="relative p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md">
            <svg width={20} fill="white" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <svg className="absolute -bottom-1 -right-1 bg-black/30 rounded-full p-0.5" width={14} height={14} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </span>
          <p className="text-lg font-semibold text-gray-900">Expense Tracking</p>
        </div>
      </div>

      {/* Data */}
      <div className="space-y-4">
        <p className="text-2xl font-bold text-gray-900">12 Expenses</p>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "62%" }}
            transition={{ duration: 1.5, delay: delay + 0.3 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Feature Card 3 - Expense Settle
function ExpenseSettleCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-6 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 border border-gray-100"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="relative p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md">
            <svg width={20} fill="white" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <svg className="absolute -bottom-1 -right-1 bg-black/30 rounded-full p-0.5" width={14} height={14} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </span>
          <p className="text-lg font-semibold text-gray-900">Expense Settle</p>
        </div>
      </div>

      {/* Data */}
      <div className="space-y-4">
        <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
          ₹28,750
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </p>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.5, delay: delay + 0.3 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const [showInitial, setShowInitial] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitial(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showInitial && <InitialLanding key="initial" />}
      </AnimatePresence>

      <AnimatePresence>
        {!showInitial && (
          <motion.section
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white"
          >
            {/* Lottie Animation Background */}
            <LottieAnimationBackground />
            
            {/* Subtle background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.2, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-50/30 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              />
            </div>

            <div className="container relative z-10 px-4 md:px-6 lg:px-8 py-12 md:py-20">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
                {/* Left Content */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    The smartest way to split expenses
                  </motion.div>

                  {/* Main heading */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900"
                  >
                    Split expenses{" "}
                    <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                      effortlessly
                    </span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base md:text-lg lg:text-xl text-gray-600 max-w-xl"
                  >
                    Simplify shared expenses with smart tracking, automatic calculations, and instant settlements. Whether it's trips, roommates, or group dinners—manage money together, stress-free.
                  </motion.p>

                  {/* CTA buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-y-4 sm:gap-x-6"
                  >
                    {/* Get Started */}
                    <Link
                      to="/auth"
                      className="shrink-0 w-[220px] h-[60px] flex justify-center items-center overflow-visible"
                    >
                      <GetStarted />
                    </Link>

                    {/* Sign In */}
                    <Link
                      to="/auth"
                      className="shrink-0 w-[220px] h-[60px] px-8 py-3 rounded-full border border-gray-300 hover:border-emerald-500 text-gray-900 font-semibold transition-all duration-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      Sign In
                    </Link>
                  </motion.div>

                  {/* Feature Cards Grid - Desktop only */}
                  <div className="hidden lg:grid grid-cols-3 gap-4 mt-8 w-full">
                    <ExpenseSplitCard delay={0.5} />
                    <ExpenseTrackingCard delay={0.6} />
                    <ExpenseSettleCard delay={0.7} />
                  </div>
                </div>

                {/* Right Side - AnimatedListDemo */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0"
                >
                  <div className="w-full max-w-md lg:max-w-lg">
                    <AnimatedListDemo />
                  </div>
                </motion.div>
              </div>

              {/* Feature Cards Grid - Mobile & Tablet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 lg:hidden max-w-3xl mx-auto">
                <ExpenseSplitCard delay={0.6} />
                <ExpenseTrackingCard delay={0.7} />
                <ExpenseSettleCard delay={0.8} />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function LottieAnimationBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingScript = document.querySelector('script[src*="dotlottie-player"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs";
    script.type = "module";
    document.body.appendChild(script);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center lg:justify-start"
    >
      {/* Glowing emerald gradient background */}
      <div className="absolute inset-0 flex items-center justify-center lg:justify-start">
        <motion.div
          className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-300/30 via-emerald-400/25 to-emerald-500/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Lottie animation */}
      <div className="w-full h-full max-w-2xl relative z-10 opacity-20 lg:opacity-25">
        <dotlottie-player
          src="https://lottie.host/8102ca17-0a7a-48c8-a1cb-199036f45561/515ZZa9CWV.lottie"
          background="transparent"
          speed="1"
          style={{ width: "100%", height: "100%" }}
          loop
          autoplay
        />
      </div>
    </div>
  );
}