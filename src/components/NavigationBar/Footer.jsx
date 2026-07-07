import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BASE_PATH = import.meta.env.VITE_BASE_PATH || "";

export default function Footer() {
  const footerVariants = {
    hidden: { y: 100 },
    visible: { y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.footer
      className="glass-card border-t border-primary shadow-soft"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex w-full justify-around items-center h-12">
        <Link
          to={`${BASE_PATH}/doctors-hub/`}
          className="flex flex-col items-center justify-center text-xs text-primary hover:text-secondary transition-colors transform hover:scale-110 duration-200 cursor-pointer p-1 rounded"
        >
          <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span className="text-[10px] leading-tight">Doctor</span>
        </Link>
        <Link
          to={`${BASE_PATH}/school-hub/`}
          className="flex flex-col items-center justify-center text-xs text-primary hover:text-secondary transition-colors transform hover:scale-110 duration-200 cursor-pointer p-1 rounded"
        >
          <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          </svg>
          <span className="text-[10px] leading-tight">School</span>
        </Link>
        <Link
          to={`${BASE_PATH}/tuition-hub/`}
          className="flex flex-col items-center justify-center text-xs text-primary hover:text-secondary transition-colors transform hover:scale-110 duration-200 cursor-pointer p-1 rounded"
        >
          <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 2v3H7V4h10zm0 4v3H7V8h10zm0 4v3H7v-3h10zm-3 4H7v-3h7v3z"/>
          </svg>
          <span className="text-[10px] leading-tight">Tuition</span>
        </Link>
      </div>
    </motion.footer>
  );
}