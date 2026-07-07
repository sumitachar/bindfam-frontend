import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Smile,
  Home,
  FileText,
  Clock,
  Leaf,
  Book,
  Sun,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageCircleHeart
} from "lucide-react";

const ParentingTips = () => {
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`mx-auto px-1.5 sm:px-3 md:px-4 lg:px-6 py-3 ${isSmallScreen ? "px-1" : ""}`}>
        {/* Main Title */}
        <motion.h2
          className={`text-primary font-semibold mb-3 mt-3 text-center ${isSmallScreen ? "text-lg" : "text-xl"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          Parenting Hub for Moms
        </motion.h2>

        <motion.div
          className={`text-text mb-4 ${isSmallScreen ? "text-xs" : "text-sm"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          Whether you're an expecting mom or navigating the joys and challenges of
          parenting, our Parenting Hub is here to support you. Find practical tips,
          trusted resources, and a community to share your journey.
        </motion.div>

           {/* SECTION: COMING SOON */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8 mb-6 p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center text-center"
        >
          <div className="flex gap-2 mb-3">
            <Sparkles className="text-primary w-5 h-5 animate-pulse" />
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase">
              Coming Soon
            </span>
            <Sparkles className="text-primary w-5 h-5 animate-pulse" />
          </div>
          
          <h4 className="text-primary font-bold text-base mb-2">More Features on the Way</h4>
          
          {/* <div className="grid grid-cols-2 gap-3 w-full mt-2">
            {[
              { icon: ShieldCheck, label: "Vaccination Tracker" },
              { icon: MessageCircleHeart, label: "Doctor Community" },
              { icon: Zap, label: "Quick Health Tips" },
              { icon: Heart, label: "Mental Wellbeing" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-primary/10">
                <feature.icon className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">{feature.label}</span>
              </div>
            ))}
          </div> */}
          
          <p className="text-[11px] text-slate-400 mt-4 italic">
            We're building a complete ecosystem for your motherhood journey.
          </p>
        </motion.div>

        {/* Section: Upcoming Moms */}
        <motion.h3
          className={`text-primary font-medium mb-2 ${isSmallScreen ? "text-sm" : "text-base"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          For Upcoming Moms
        </motion.h3>

        <motion.div
          className={`space-y-3 mb-4 ${isSmallScreen ? "space-y-2" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {[
            {
              icon: Heart,
              title: "Prenatal Care Essentials",
              description:
                "Learn about nutrition, exercise, and checkups to ensure a healthy pregnancy.",
            },
            {
              icon: Smile,
              title: "Emotional Preparation",
              description:
                "Discover ways to manage stress and build confidence as you prepare for motherhood.",
            },
            {
              icon: Home,
              title: "Planning Your Nursery",
              description: "Tips for creating a safe, cozy space for your baby.",
            },
            {
              icon: FileText,
              title: "Creating a Birth Plan",
              description:
                "Understand your options and prepare for delivery with a personalized plan.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="glass-card border border-primary rounded-lg shadow-soft"
              >
                <CardContent className={`p-2 flex items-center ${isSmallScreen ? "p-1.5" : ""}`}>
                  <div className={`flex items-center justify-center rounded-full mr-2 bg-input ${isSmallScreen ? "w-8 h-8" : "w-10 h-10"}`}>
                    <Icon className={`text-primary ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-primary mb-0.5 ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                      {item.title}
                    </h4>
                    <p className={`text-text ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Section: Daily Parenting Tips */}
        <motion.h3
          className={`text-primary font-medium mb-2 ${isSmallScreen ? "text-sm" : "text-base"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          Daily Parenting Tips
        </motion.h3>

        <motion.div
          className={`space-y-3 mb-6 ${isSmallScreen ? "space-y-2" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {[
            {
              icon: Clock,
              title: "Set a Gentle Routine",
              description:
                "Consistency helps your child feel secure and balanced throughout the day.",
            },
            {
              icon: Leaf,
              title: "Healthy Meals & Snacks",
              description:
                "Offer nutritious meals and involve kids in simple cooking to build good habits.",
            },
            {
              icon: Book,
              title: "Bedtime Storytime",
              description:
                "Reading daily boosts imagination, language, and strengthens your bond.",
            },
            {
              icon: Sun,
              title: "Encourage Outdoor Play",
              description:
                "Fresh air, sunshine, and movement are essential for your child’s growth.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="glass-card border border-primary rounded-lg shadow-soft"
              >
                <CardContent className={`p-2 flex items-center ${isSmallScreen ? "p-1.5" : ""}`}>
                  <div className={`flex items-center justify-center rounded-full mr-2 bg-input ${isSmallScreen ? "w-8 h-8" : "w-10 h-10"}`}>
                    <Icon className={`text-primary ${isSmallScreen ? "w-4 h-4" : "w-5 h-5"}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-primary mb-0.5 ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                      {item.title}
                    </h4>
                    <p className={`text-text ${isSmallScreen ? "text-xs" : "text-sm"}`}>
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

     
      </div>
    </motion.div>
  );
};

export default ParentingTips;