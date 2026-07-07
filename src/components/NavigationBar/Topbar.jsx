import React, { useContext, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { Button } from "../Ui/button";
import logo from "/assets/logoTransp.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BASE_PATH = import.meta.env.VITE_BASE_PATH || "";

export default function TopBar({ toggleLeftNav, toggleRightNav }) {
  const { user, selectedEntity } = useContext(UserContext);

  const navigate = useNavigate();
  const loggedUrls = useRef(new Set());

  const getUserImageUrl = user?.profileImageUrl || null;

  const handleGoToCalendar = () => {
    navigate(`${BASE_PATH}/family-calendar`);
  };

  const navbarVariants = {
    hidden: { y: -100 },
    visible: { y: 0, transition: { duration: 0.3 } },
  };

  const navbarClasses =
    "fixed top-0 left-0 right-0 z-40 glass-card shadow-soft px-3 flex items-center justify-between h-20 w-full text-text ";

  const showCalendar = user?.role === "parent";

  return (
    <motion.nav
      className={navbarClasses}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center space-x-3">
        {selectedEntity ? (
          <>
            {toggleLeftNav && (
              <button
                onClick={toggleLeftNav}
                className="p-2 rounded-full hover:bg-input transition"
                aria-label="Toggle left navigation"
              >
                <svg
                  className="w-6 h-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            )}
            <div className="flex flex-col justify-center">
              <span className="text-base font-semibold text-primary ">
                {selectedEntity.name} | {selectedEntity.subUserId}
              </span>
              <span className="text-xs text-muted truncate">
                {selectedEntity?.ageFormatted}
              </span>
            </div>
          </>
        ) : (
          <div
            className="flex items-center pl-2 space-x-1 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3">
        {showCalendar && (
          <Button
            onClick={handleGoToCalendar}
            className="calendar-button rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:shadow-lg hover:scale-[1.05] transition-all flex items-center justify-center gap-1 sm:gap-2"
            title="Family Calendar"
          >
            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
        )}

        <button
          onClick={toggleRightNav}
          className="p-1 rounded-full hover:bg-input transition"
          aria-label="Toggle right navigation"
        >
           {getUserImageUrl  ? (
                  <img
                    src={getUserImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-primary shadow-sm object-cover"
                    onError={() => setUserImageError(true)}
                  />
          ) : (
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </motion.nav>
  );
}
