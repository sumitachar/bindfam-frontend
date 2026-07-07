import React, { useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

const LeftNavigationBar = ({ isOpen, setIsOpen }) => {
  const { user, selectedEntity, isDoctor } = useContext(UserContext);
  const sidebarRef = useRef();
  const location = useLocation();

  const sectionVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  // Close sidebar on route change
  useEffect(() => setIsOpen(false), [location.pathname, setIsOpen]);

  return (
    <AnimatePresence>
      {user && isOpen && (
        <motion.div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r shadow-2xl z-50 overflow-y-auto"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={sectionVariants}
        >
          <div className="flex items-center justify-center py-4 text-2xl font-bold space-x-1">
            <span className="text-blue-900">Bind</span>
            <span className="text-orange-600">Fam</span>
          </div>

          <div className="p-2 space-y-4">
            {/* Doctor Sidebar */}
            {isDoctor && (
              <motion.div variants={sectionVariants} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 shadow-sm text-xs">
                <Link to="/doctor-dashboard" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition">Wall</Link>
                <div className="text-green-700 font-bold text-sm mt-2">PATIENTS</div>
                <Link to="/patient-details" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition">Patient Details</Link>
              </motion.div>
            )}

            {/* Doctor Child Care */}
            {isDoctor && selectedEntity && (
              <motion.div variants={sectionVariants} className="bg-green-100 dark:bg-green-700 rounded-xl p-3 shadow-sm text-xs">
                <div className="font-bold text-green-900 text-sm">
                  CHILD CARE ({selectedEntity.name.split(" ")[0].slice(0, 8)})
                </div>
                {selectedEntity.permissions?.growth && <Link to="/growth-tracker" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-green-200 dark:hover:bg-green-600 rounded transition">Growth Tracker</Link>}
                {selectedEntity.permissions?.medicines && <Link to="/medicines" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-green-200 dark:hover:bg-green-600 rounded transition">Medicines</Link>}
                {selectedEntity.permissions?.prescription && <Link to="/prescriptions" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-green-200 dark:hover:bg-green-600 rounded transition">Prescriptions</Link>}
                {selectedEntity.Permissions?.vaccination && <Link to="/immunizations" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-green-200 dark:hover:bg-green-600 rounded transition">Immunizations</Link>}
              </motion.div>
            )}

            {/* Parent Sidebar */}
            {(!user?.role || user?.role === "parent") && (
              
              <motion.div variants={sectionVariants} className="bg-purple-100 dark:bg-purple-700 rounded-xl p-3 shadow-sm text-xs">
                <div className="font-bold text-purple-900 text-sm">CHILD CARE</div>
                <Link to="/growth-tracker" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded transition">Growth Tracker</Link>
                <Link to="/medicines" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded transition">Medicines</Link>
                <Link to="/prescriptions" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded transition">Prescriptions</Link>
                <Link to="/immunizations" onClick={() => setIsOpen(false)} className="block p-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded transition">Immunizations</Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftNavigationBar;
