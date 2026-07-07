// src/components/NavigationBar/RightNavigationBar.jsx
import React, { useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import logo from "/assets/logoTransp.png";

import {
  Users,
  LogOut,
  UserCog,
  Baby,
  HeartHandshake,
  Lightbulb,
  Stethoscope,
  Settings,
  Calendar,
  Wallet,
  ShoppingCart,
  X,
  LineChart,
  ClipboardList,
  MessageSquare,
  Home
} from "lucide-react";
import ChangePasswordModal from "../ChnagePassword/ChangePasswordModal";
import { Nav } from "react-day-picker";

export const NavItem = ({
  to,
  children,
  icon: Icon,
  onClick,
  disabled = false,
}) => {
  const location = useLocation();
  const isActive = to
    ? location.pathname.startsWith(to) || location.pathname === to
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
      onClick={!disabled ? onClick || (() => {}) : null}
    >
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
          const sidebar = document.querySelector(".right-sidebar");
          if (sidebar && window.innerWidth < 768) {
            const closeHandler = sidebar.__reactProps$close?.onClick;
            closeHandler?.(false);
          }
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
};

// নতুন আলাদা কম্পোনেন্ট — Account Settings (সব রোলের জন্য একই)
const AccountSettingsSection = ({ panelVariants, handleLogout }) => {
  return (
    <motion.div
      variants={panelVariants}
      className="bg-white rounded-2xl mt-4 p-5 shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* হেডার */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="bg-gradient-to-br from-[#06b6d4]/10 to-[#22d3ee]/10 p-2.5 rounded-lg">
          <Settings className="w-5 h-5 text-[#06b6d4]" />
        </div>
        <span className="font-semibold text-gray-800 text-base">
          Account Settings
        </span>
      </div>

      {/* অপশনগুলো */}
      <div className="space-y-1">
        <ChangePasswordModal />

        <NavItem
          to="/feedback"
          icon={MessageSquare}
          className="hover:bg-cyan-50/60 transition-colors"
        >
          <span className="text-[#0891b2] font-medium">Send Feedback</span>
        </NavItem>

        <NavItem
          onClick={handleLogout}
          icon={LogOut}
          className="mt-5 pt-5 border-t border-gray-100 hover:bg-red-50/50 transition-colors"
        >
          <span className="text-red-600 font-medium">Log Out</span>
        </NavItem>
      </div>
    </motion.div>
  );
};

const RightNavigationBar = ({ isOpen, setIsOpen }) => {
  const { logout, user, selectedEntity, setSelectedEntity, isReadOnly } =
    useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const panelRef = useRef();

  const hasActiveChild =
    !!selectedEntity &&
    !!selectedEntity.subUserId &&
    selectedEntity.age !== undefined &&
    !!selectedEntity.gender;

  const panelVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.3 } },
    exit: { x: "100%", transition: { duration: 0.3 } },
  };

  const navigateSafe = (path) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    navigate(path);
    setTimeout(() => (isNavigating.current = false), 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.message);
      alert("Failed to logout. Please try again.");
    }
  };

  const handleSwitchProfile = () => {
    setIsOpen(false);
    setSelectedEntity(null);
    localStorage.removeItem("selectedEntityId");
    navigate("/account-selection");
  };

  const handleDrConnection = () => {
    if (isReadOnly || !hasActiveChild || isNavigating.current) return;
    setIsOpen(false);
    navigateSafe("/doctor-connection");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const renderPanelContent = () => {
    // DOCTOR MENU
    if (user?.role === "doctor") {
      return (
        <>
          <motion.div
            variants={panelVariants}
            className="bg-input rounded-xl mt-3 p-4 shadow-soft"
          >
            <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5" />
              DOCTOR MENU
            </div>
            <NavItem to="/doctor-dashboard" icon={Home}>
              Home
            </NavItem>

            <NavItem to="/patients" icon={Users}>
              My Patients
            </NavItem>

            <NavItem to="/prescribe-patient" icon={Users}>
              Prescribe Patient
            </NavItem>

            <NavItem to="/doctor-patient-chat" icon={Users}>
             Patient Chat
            </NavItem>

            
          </motion.div>

          {/* Common Account Settings */}
          <AccountSettingsSection
            panelVariants={panelVariants}
            handleLogout={handleLogout}
          />
        </>
      );
    }

    // ADMIN MENU
    if (user?.role === "admin") {
      return (
        <>
          <motion.div
            variants={panelVariants}
            className="bg-input rounded-xl mt-3 p-4 shadow-soft"
          >
            <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
              <UserCog className="w-5 h-5" />
              ADMIN MENU
            </div>

            <NavItem to="/users" icon={Users}>
              User Management
            </NavItem>

            <NavItem to="/reports" icon={LineChart}>
              System Reports
            </NavItem>
          </motion.div>

          {/* Common Account Settings */}
          <AccountSettingsSection
            panelVariants={panelVariants}
            handleLogout={handleLogout}
          />
        </>
      );
    }

    // PARENT MENU
    return (
      <div className="space-y-4 p-3">
        <motion.div
          variants={panelVariants}
          className="bg-input rounded-xl p-4 shadow-soft"
        >
          <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
            <Baby className="w-5 h-5" />
            PARENTING
          </div>

          <NavItem to="/parenting-tips" icon={Lightbulb}>
            Parenting Tips
          </NavItem>

          <NavItem to="/family-expenses" icon={Wallet}>
            Family Expense
          </NavItem>

          <NavItem to="/family-calendar" icon={Calendar}>
            Calendar
          </NavItem>

          <NavItem to="/shopping" icon={ShoppingCart}>
            Shopping
          </NavItem>

          <NavItem to="/utility-lists" icon={ClipboardList}>
            Smart List
          </NavItem>
        </motion.div>

        <motion.div
          variants={panelVariants}
          className="bg-input rounded-xl p-4 shadow-soft"
        >
          <div className="text-primary font-bold text-base flex items-center gap-2 mb-3">
            <HeartHandshake className="w-5 h-5" />
            CONNECTION
          </div>

          {hasActiveChild && !isReadOnly ? 
          <>
            <NavItem onClick={handleDrConnection} icon={HeartHandshake}>
              <span className="text-green-600">Doctor Connection</span>
            </NavItem>

            <NavItem to="/doctor-patient-chat" icon={MessageSquare}>
              Doctor Chat
            </NavItem>
          </>
        
          : (
            <NavItem icon={HeartHandshake} disabled>
              Doctor Connection (Select Child)
            </NavItem>
          )}

          <NavItem onClick={handleSwitchProfile} icon={UserCog}>
            Account Selection
          </NavItem>
        </motion.div>

        {/* Common Account Settings for Parent */}
        <AccountSettingsSection
          panelVariants={panelVariants}
          handleLogout={handleLogout}
        />
      </div>
    );
  };

  const storagePercent =
    user && user.storageLimit
      ? Math.min((user.usedStorage / user.storageLimit) * 100, 100)
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="right-sidebar fixed top-0 right-0 h-full w-74 glass-card border-l border-primary/20 shadow-2xl z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 rounded-l-2xl p-1"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Logo + Storage */}
          <div
            className="py-4 border-b border-primary/10 cursor-pointer space-y-2"
            onClick={() => navigate("/")}
          >
            {/* Logo */}
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            {user && (
              <div className="px-4">
                <p className="text-primary font-bold text-base flex items-center gap-2 mb-3">
                  Storage
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="whitespace-nowrap">
                    {user.usedStorage.toFixed(2)} MB /{" "}
                    {(user.storageLimit / 1024).toFixed(0)} GB
                  </span>

                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.max(storagePercent, 1)}%`,
                      }}
                    />
                  </div>

                  <span className="text-primary font-medium">
                    {storagePercent < 1
                      ? storagePercent.toFixed(2)
                      : storagePercent.toFixed(0)}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Menu Content */}
          <div className="pt-2">{renderPanelContent()}</div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 left-5 text-primary hover:text-secondary transition-colors"
            aria-label="Close right navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightNavigationBar;
