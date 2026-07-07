import React from "react";
import { motion } from "framer-motion";
import logo from "/assets/logo_bindfam.png";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-[#fefcf5] via-[#f7f5f0] to-[#f9f9f9] dark:from-[#0f172a] dark:via-[#1b263b] dark:to-[#111827] z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src={logo}
        alt="Logo"
        className="w-40 sm:w-60 h-40 sm:h-28 mb-4 object-contain drop-shadow-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.h1
        className="text-xl font-extrabold text-center text-primary"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Welcome to <span className="text-bind">Bind</span>
        <span className="text-fam">Fam</span>
      </motion.h1>
    </motion.div>
  );
}