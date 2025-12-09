// import { motion } from "framer-motion";
// import { ArrowRight, Users, Receipt, TrendingUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";

// export function HeroSection() {
//   return (
//     <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
//       {/* Background decorations */}
//       <div className="absolute inset-0 overflow-hidden">
//         <motion.div 
//           className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
//           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
//           transition={{ duration: 8, repeat: Infinity }}
//         />
//         <motion.div 
//           className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 10, repeat: Infinity, delay: 1 }}
//         />
//       </div>

//       <div className="container relative z-10 px-4 md:px-6 py-20">
//         <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
//           >
//             <span className="relative flex h-2 w-2">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
//             </span>
//             The smartest way to split expenses
//           </motion.div>

//           {/* Main heading */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance"
//           >
//             Split expenses{" "}
//             <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//               effortlessly
//             </span>
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance"
//           >
//             Track shared expenses, settle debts, and manage group finances with ease. 
//             Perfect for trips, roommates, and everyday life.
//           </motion.p>

//           {/* CTA buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="flex flex-col sm:flex-row gap-4"
//           >
//             <Button asChild variant="hero" size="xl">
//               <Link to="/auth">
//                 Get Started Free
//                 <ArrowRight className="ml-1 h-5 w-5" />
//               </Link>
//             </Button>
//             <Button asChild variant="outline" size="xl">
//               <Link to="/auth">
//                 Sign In
//               </Link>
//             </Button>
//           </motion.div>

//           {/* Feature cards */}
//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.5 }}
//             className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-3xl"
//           >
//             <FeatureCard
//               icon={Users}
//               title="Create Groups"
//               description="Add friends, family, or roommates"
//               delay={0}
//             />
//             <FeatureCard
//               icon={Receipt}
//               title="Track Expenses"
//               description="Log bills and split costs fairly"
//               delay={0.1}
//             />
//             <FeatureCard
//               icon={TrendingUp}
//               title="Settle Up"
//               description="See who owes whom instantly"
//               delay={0.2}
//             />
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function FeatureCard({
//   icon: Icon,
//   title,
//   description,
//   delay,
// }: {
//   icon: React.ElementType;
//   title: string;
//   description: string;
//   delay: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.5 + delay }}
//       className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300"
//     >
//       <div className="p-3 rounded-xl gradient-primary mb-4">
//         <Icon className="h-6 w-6 text-primary-foreground" />
//       </div>
//       <h3 className="font-semibold text-foreground mb-1">{title}</h3>
//       <p className="text-sm text-muted-foreground text-center">{description}</p>
//     </motion.div>
//   );
// }



import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Receipt, TrendingUp, Wallet, PieChart, CreditCard } from "lucide-react";

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState({ started: false, signIn: false });

  const handleGetStarted = () => {
    setIsLoading({ ...isLoading, started: true });
    // Redirect to auth page for registration
    setTimeout(() => {
      window.location.href = "/auth?mode=signup";
    }, 300);
  };

  const handleSignIn = () => {
    setIsLoading({ ...isLoading, signIn: true });
    // Redirect to auth page for sign in
    setTimeout(() => {
      window.location.href = "/auth?mode=signin";
    }, 300);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 md:w-96 md:h-96 rounded-full bg-emerald-400/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-40 w-64 h-64 md:w-80 md:h-80 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative z-10 px-4 md:px-8 lg:px-12 py-12 md:py-20 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col space-y-6 md:space-y-8 max-w-2xl">
            {/* App Name & Developer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-gray-900">Your finances</span>
                <br />
                <span className="text-gray-900">are </span>
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  no joke
                </span>
              </h1>
              <p className="text-sm md:text-base text-emerald-600 font-medium">SplitXo - Expense Management System</p>
              <p className="text-xs md:text-sm text-gray-500">Developed by Sachin Yadav (srdev)</p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed"
            >
              Whether you're in a band together or business partners, 
              tracking and splitting your shared finances could be too complicated. 
              <span className="font-semibold text-gray-900"> We make it easy and fun.</span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <button 
                onClick={handleGetStarted}
                disabled={isLoading.started}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading.started ? "Loading..." : "Get Started"}
                {!isLoading.started && <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
              <button 
                onClick={handleSignIn}
                disabled={isLoading.signIn}
                className="text-gray-700 hover:text-gray-900 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading.signIn ? "Loading..." : "Sign In"}
                {!isLoading.signIn && <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
            </motion.div>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-4"
            >
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-700 text-xs md:text-sm font-medium">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                Create Groups
              </div>
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-700 text-xs md:text-sm font-medium">
                <Receipt className="h-3 w-3 md:h-4 md:w-4" />
                Track Expenses
              </div>
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-700 text-xs md:text-sm font-medium">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                Settle Debts
              </div>
            </motion.div>
          </div>

          {/* Right Side - Floating Cards */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] mt-8 lg:mt-0">
            {/* Main Balance Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-24 md:top-32 right-0 sm:right-10 lg:right-0 w-64 md:w-72 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border border-emerald-100"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Total Balance</span>
                  <Wallet className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  ₹23,040.24
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-600">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
            </motion.div>

            {/* Transaction List Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute top-0 md:top-0 right-16 sm:right-32 lg:right-20 w-56 md:w-64 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100"
            >
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-xs md:text-sm font-semibold text-gray-900">Recent Expenses</h3>
                {[
                  { name: "Lunch", amount: "₹1,200", color: "bg-blue-500" },
                  { name: "Grocery", amount: "₹3,450", color: "bg-purple-500" },
                  { name: "Transport", amount: "₹850", color: "bg-emerald-500" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 md:py-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${item.color}`} />
                      <span className="text-xs md:text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-900">{item.amount}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute bottom-16 md:bottom-20 right-4 sm:right-10 lg:right-10 w-48 md:w-56 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl"
            >
              <div className="space-y-2 md:space-y-3">
                <PieChart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                <div className="space-y-1.5 md:space-y-2">
                  {[70, 55, 85, 40].map((width, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 md:h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 1, delay: 1 + i * 0.1 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-0 md:bottom-0 right-40 sm:right-52 lg:right-64 w-32 md:w-40 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100"
            >
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 mb-1.5 md:mb-2" />
              <div className="text-xl md:text-2xl font-bold text-gray-900">156</div>
              <div className="text-xs text-gray-600">Total Splits</div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear" 
              }}
              className="absolute -top-10 right-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 blur-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}