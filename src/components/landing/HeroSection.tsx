import { motion } from "framer-motion";
import { ArrowRight, Users, Receipt, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { AnimatedListDemo } from "../AnimatedListDemo";

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

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Lottie Animation Background - Behind text content */}
      <LottieAnimationBackground />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
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
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white"
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
              className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-xl"
            >
              Track shared expenses, settle debts, and manage group finances with ease. Perfect for trips, roommates, and everyday life.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="px-8 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-900 dark:text-white font-medium transition-all duration-200">
                Sign In
              </button>
            </motion.div>

            {/* Feature cards - Desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden lg:grid grid-cols-3 gap-4 mt-8 w-full"
            >
              <FeatureCard
                icon={Users}
                title="Group Creation"
                description="Organize friends easily"
                delay={0}
              />
              <FeatureCard
                icon={Receipt}
                title="Expense Tracking"
                description="Log bills instantly"
                delay={0.1}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Smart Settling"
                description="Balance debts automatically"
                delay={0.2}
              />
            </motion.div>
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

        {/* Feature cards - Mobile & Tablet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 lg:hidden max-w-3xl mx-auto"
        >
          <FeatureCard
            icon={Users}
            title="Group Creation"
            description="Organize friends easily"
            delay={0}
          />
          <FeatureCard
            icon={Receipt}
            title="Expense Tracking"
            description="Log bills instantly"
            delay={0.1}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Smart Settling"
            description="Balance debts automatically"
            delay={0.2}
          />
        </motion.div>
      </div>
    </section>
  );
}

function LottieAnimationBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="dotlottie-player"]');
    if (existingScript) return;

    // Create script element for Lottie player
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      // Don't remove the script to avoid re-loading issues
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-20 lg:opacity-30 flex items-center justify-center lg:justify-start"
    >
      <div className="w-full h-full max-w-2xl">
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

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4">
          <Icon
            className="w-6 h-6 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Description */}
        <p className="text-sm text-white/80 leading-relaxed">{description}</p>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}