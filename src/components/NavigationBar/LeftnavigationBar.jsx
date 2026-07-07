// src/components/NavigationBar/LeftNavigationBar.jsx
import React, { useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import logo from "/assets/logoTransp.png";

import {
  Home,
  Users,
  LineChart,
  Pill,
  FileText,
  Syringe,
  Folder,
  Book,
  LayoutDashboard,
  ClipboardList,
  Baby,
  Stethoscope,
  UserCog,
  X,
} from "lucide-react";

// Unified Compact NavItem — identical to RightNavigationBar
const NavItem = ({ to, children, icon: Icon, onClick, disabled = false }) => {
  const location = useLocation();
  const isActive = to
    ? location.pathname === to || location.pathname.startsWith(to)
    : false;

  const content = (
    <div
      className={`
        relative flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300
        group overflow-hidden cursor-pointer select-none
        ${
          disabled
            ? "opacity-40 cursor-not-allowed text-muted"
            : isActive
              ? "bg-primary/10 text-primary font-bold border border-primary/30 shadow-md shadow-primary/10"
              : "text-muted hover:bg-input hover:text-primary"
        }
      `}
      onClick={!disabled ? onClick || (() => {}) : undefined}
    >
      {/* Left Glow Bar */}
      <span
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full
          transition-all duration-500 origin-left
          ${
            isActive && !disabled
              ? "opacity-100 scale-x-100"
              : "opacity-0 scale-x-0"
          }
        `}
      />

      <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
      <span className="relative z-10">{children}</span>
    </div>
  );

  if (to && !disabled && !onClick) {
    return (
      <Link
        to={to}
        onClick={() => {
          const sidebar = document.getElementById("left-sidebar");
          if (sidebar && window.innerWidth < 768) {
            // Close mobile sidebar
            sidebar.dispatchEvent(new CustomEvent("close-sidebar"));
          }
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
};

const LeftNavigationBar = ({ isOpen, setIsOpen }) => {
  const { user, selectedEntity, isDoctor, setSelectedEntity } =
    useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef();

  const panelVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "-100%", transition: { duration: 0.25 } },
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="left-sidebar"
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full w-72 glass-card border-r border-primary/20 shadow-2xl z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 rounded-r-2xl"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Logo */}
          <div
            className="flex items-center justify-center py-5 border-b border-primary/10 cursor-pointer"
            onClick={() => {
              navigate("/");
              // Remove selected entity
              setSelectedEntity(null);
              localStorage.removeItem("selectedEntityId");

              // Close sidebar if mobile
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          >
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Compact Menu Content */}
          <div className="pt-2 px-3 space-y-4">
            {/* DOCTOR VIEW */}
            {(isDoctor || user?.role === "doctor") && (
              <>
                <motion.div
                  variants={panelVariants}
                  className="bg-input rounded-xl p-4 shadow-soft"
                >
                  <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
                    <Stethoscope className="w-5 h-5" />
                    DOCTOR MENU
                  </div>
                 

                  <NavItem to="/patient-details" icon={Home}>
                    Patient Dashboard
                  </NavItem>
                  <NavItem to="/prescribe-patient" icon={Users}>
                    Prescribe Patient
                  </NavItem>
                </motion.div>

                {selectedEntity && (
                  <motion.div
                    variants={panelVariants}
                    className="bg-input rounded-xl p-4 shadow-soft"
                  >
                    <div className="text-primary font-bold text-base mb-3">
                      CHILD: {selectedEntity.name.split(" ")[0]}
                    </div>

                    {selectedEntity.permissions?.growth && (
                      <NavItem to="/growth-tracker" icon={LineChart}>
                        Growth Tracker
                      </NavItem>
                    )}
                    {selectedEntity.permissions?.medicalReports && (
                      <NavItem to="/medical-reports" icon={ClipboardList}>
                        Medical Reports
                      </NavItem>
                    )}
                    {selectedEntity.permissions?.medicines && (
                      <NavItem to="/medicines" icon={Pill}>
                        Medicines
                      </NavItem>
                    )}
                    {selectedEntity.permissions?.prescription && (
                      <NavItem to="/prescriptions" icon={FileText}>
                        Prescriptions
                      </NavItem>
                    )}
                    {selectedEntity.permissions?.vaccination && (
                      <NavItem to="/immunizations" icon={Syringe}>
                        Immunizations
                      </NavItem>
                    )}
                  </motion.div>
                )}
              </>
            )}

            {/* ADMIN VIEW */}
            {user?.role === "admin" && (
              <motion.div
                variants={panelVariants}
                className="bg-input rounded-xl p-4 shadow-soft"
              >
                <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
                  <UserCog className="w-5 h-5" />
                  ADMIN MENU
                </div>

                <NavItem to="/users" icon={Users}>
                  Manage Users
                </NavItem>
                <NavItem to="/reports" icon={LineChart}>
                  System Reports
                </NavItem>
              </motion.div>
            )}

            {/* PARENT / DEFAULT USER VIEW */}
            {(!user?.role ||
              user?.role === "parent" ||
              user?.role === "user") && (
              <>
                <motion.div
                  variants={panelVariants}
                  className="bg-input rounded-xl p-4 shadow-soft"
                >
                  <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
                    <LayoutDashboard className="w-5 h-5" />
                    DASHBOARD
                  </div>

                  <NavItem to="/home" icon={Home}>
                    Memory Wall
                  </NavItem>
                  <NavItem to="/documents" icon={Folder}>
                    Documents Hub
                  </NavItem>
                  <NavItem to="/education" icon={Book}>
                    Education
                  </NavItem>
                  <NavItem to="/album" icon={Book}>
                    Photo Album
                  </NavItem>
                </motion.div>

                <motion.div
                  variants={panelVariants}
                  className="bg-input rounded-xl p-4 shadow-soft"
                >
                  <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
                    <Baby className="w-5 h-5" />
                    CHILD CARE
                  </div>

                  <NavItem to="/growth-tracker" icon={LineChart}>
                    Growth Tracker
                  </NavItem>
                  <NavItem to="/medical-reports" icon={ClipboardList}>
                    Medical Reports
                  </NavItem>
                  <NavItem to="/medicines" icon={Pill}>
                    Medicines
                  </NavItem>
                  <NavItem to="/prescriptions" icon={ClipboardList}>
                    Prescriptions
                  </NavItem>
                  <NavItem to="/immunizations" icon={Syringe}>
                    Immunizations
                  </NavItem>
                </motion.div>
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-4 text-primary hover:text-secondary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftNavigationBar;
