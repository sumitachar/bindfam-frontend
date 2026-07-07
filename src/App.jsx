import React, { useState, useContext, useEffect, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import LeftNavigationBar from "./components/NavigationBar/LeftNavigationBar";
import RightNavigationBar from "./components/NavigationBar/RightNavigationBar";
import TopBar from "./components/NavigationBar/TopBar";
import { routes } from "./routes";
import { toast } from "sonner";
import { logActivity } from "./lib/activityLogger";


const App = () => {
  const { user, selectedEntity, loading } = useContext(UserContext);

  const [appLoading, setAppLoading] = useState(true);
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------
  // Splash Screen Timer
  // -------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
  if (!user || loading || appLoading) return;

  logActivity({
    user,
    path: location.pathname,
    selectedEntity,
    purpose: "page_view",
  });
}, [location.pathname]);

  // ----------------------------------------------------
  // AUTH + ROLE BASED ROUTE GUARD (ROOT SAFE VERSION)
  // ----------------------------------------------------
  useEffect(() => {
    if (appLoading || loading) return;

    const path = location.pathname.toLowerCase().replace(/\/+$/, "");

    // ⭐ IMPORTANT:
    // "/" is fully handled by <RootRedirect />
    if (path === "/") return;

    // -------------------------------
    // Unauthenticated user
    // -------------------------------
    if (!user) {
      if (!["/login", "/register"].includes(path)) {
        navigate("/login", { replace: true });
      }
      return;
    }

    // -------------------------------
    // Parent Role Logic
    // -------------------------------
    if (user.role === "parent") {
      // Pages that can be accessed without selecting a child/sub-user
      const allowedWithoutChild = [
        "/account-selection",
        "/parenting-tips",
        "/feedback",
      ];

      // Pages that REQUIRE a selected child/sub-user
      const requireChildPages = [
        "/family-expenses",
        "/family-calendar",
        "/shopping",
        "/utility-lists",
        // Add any other pages that need a selected child here
      ];

      // Case 1: Trying to access a page that requires child but none selected
      if (!selectedEntity && requireChildPages.includes(path)) {
        toast.warning("No child selected", {
          description:
            "You need to select a child or sub-user first to use this feature.",
          duration: 6000,
          action: {
            label: "Select Child Now",
            onClick: () => navigate("/account-selection"),
          },
        });

        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/account-selection", { replace: true });
        }, 3000);

        return;
      }

      // Case 2: Any other protected page → redirect without toast
      if (!selectedEntity && !allowedWithoutChild.includes(path)) {
        navigate("/account-selection", { replace: true });
        return;
      }
    }

    // -------------------------------
    // Doctor Role Logic
    // -------------------------------
    if (user.role === "doctor") {
      const allowedDoctorRoutes = [
        "/doctor-dashboard",
        "/patient-details",
        "/growth-tracker",
        "/medical-reports",
        "/medicines",
        "/prescriptions",
        "/immunizations",
        "/prescribe-patient",
        "/patients",
        "/feedback",
        "/doctor-patient-chat" // Now doctors can access feedback page
      ];

      if (!allowedDoctorRoutes.includes(path)) {
        navigate("/doctor-dashboard", { replace: true });
        return;
      }
    }

    // -------------------------------
    // Admin Role Logic
    // -------------------------------
    if (user.role === "admin") {
      const allowedAdminRoutes = [
        "/admin-dashboard",
        "/manage-users", // Manage Users page
        "/feedback",
        "/system-reports",
        "/doctor-approvals",
        "/analytics"
      ];

      // Normalize path (remove trailing slash)
      const normalizedPath = path.replace(/\/+$/, "");

      if (!allowedAdminRoutes.includes(normalizedPath)) {
        navigate("/admin-dashboard", { replace: true });
        return;
      }
    }
  }, [user, selectedEntity, loading, appLoading, navigate, location.pathname]);

  // -------------------------------
  // Sidebar Toggle Handlers
  // -------------------------------
  const toggleLeftNav = () => {
    setIsLeftNavOpen((prev) => !prev);
    if (isRightNavOpen) setIsRightNavOpen(false);
  };

  const toggleRightNav = () => {
    setIsRightNavOpen((prev) => !prev);
    if (isLeftNavOpen) setIsLeftNavOpen(false);
  };

  // -------------------------------
  // Global Loading State
  // -------------------------------
  if (appLoading || loading) {
    return <SplashScreen />;
  }

  // -------------------------------
  // Navbar Visibility Rule
  // -------------------------------
  const shouldRenderNavbar =
    user && !["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen flex relative">
      {/* Mobile Overlay Blur */}
      {(isLeftNavOpen || isRightNavOpen) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => {
            setIsLeftNavOpen(false);
            setIsRightNavOpen(false);
          }}
        />
      )}

      {/* Sidebars */}
      {user && selectedEntity && (
        <LeftNavigationBar
          isOpen={isLeftNavOpen}
          setIsOpen={setIsLeftNavOpen}
        />
      )}

      {user && (
        <RightNavigationBar
          isOpen={isRightNavOpen}
          setIsOpen={setIsRightNavOpen}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        style={{
          marginLeft:
            isLeftNavOpen && selectedEntity && window.innerWidth >= 768
              ? "256px"
              : "0px",

          marginRight:
            isRightNavOpen && window.innerWidth >= 768 ? "256px" : "0px",
        }}
      >
        {/* TOP BAR */}
        {shouldRenderNavbar && (
          <div className="sticky top-0 z-30 bg-background shadow-sm">
            <TopBar
              toggleLeftNav={toggleLeftNav}
              toggleRightNav={toggleRightNav}
            />
          </div>
        )}

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 bg-background pt-20">
          <div className="w-full max-w-6xl mx-auto px-4 pb-8">
            <Suspense fallback={<SplashScreen />}>
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
