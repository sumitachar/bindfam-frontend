import path from "path";
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import RootRedirect from "./RootRedirect";

// Lazy Auth pages
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const AccountSelection = lazy(() => import("./pages/Parents/Home/AccountSelection"));
const CreateChildProfilePage = lazy(() => import("./pages/Parents/Home/CreateChildProfilePage"));

// Lazy Dashboards
const DoctorDashboardPage = lazy(() => import("./pages/Doctors/DoctorDashboard"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const HomePage = lazy(() => import("./pages/Parents/Home/HomePage"));
const Documents = lazy(() => import("./pages/Parents/Dashboard/Documents"));
const GrowthTracker = lazy(() => import("./pages/Parents/ChildCare/GrowthTracker"));
const Education = lazy(() => import("./pages/Parents/Dashboard/Education"));
const Medicines = lazy(() => import("./pages/Parents/ChildCare/Medicines"));
const Prescriptions = lazy(() => import("./pages/Parents/ChildCare/Prescriptions"));
const Immunization = lazy(() => import("./pages/Parents/ChildCare/Immunization"));
const MedicalReports = lazy(() => import("./pages/Parents/ChildCare/MedicalReport"));  
const DrConnectionWithChild = lazy(() => import("./pages/Parents/ParentsConnection/DrConnectionWithChild"));
const ParentingTips = lazy(() => import("./pages/Parents/ParentsConnection/ParentingTips"));
const PatientDetailsPage = lazy(() => import("./pages/Doctors/PatientDetailsPage"));
const MyPatientsPage = lazy(()=> import("./pages/Doctors/MyPatientsPage"))
const NotFoundPage = lazy(() => import("./components/NavigationBar/NotFoundPage"));
const FamilyCalendar = lazy(() => import("./pages/Parents/Calender/FamilyCalendar"));
const Expenses = lazy(() => import("./pages/Parents/Expence/Expenses"));
const Shopping = lazy(() => import("./pages/Parents/Shopping/ShoppingPage"));
const AlbumPage = lazy(() => import("./pages/Parents/Dashboard/AlbumPage"));
const UtilityLists = lazy(() => import("./pages/Parents/UtilityLists/UtilityLists"));
const PrescribePatientPage = lazy(() => import("./pages/Doctors/PrescribePatientPage"));
const FeedbackPage = lazy(() => import("./pages/Feedback/FeedbackPage"))
const ManageUsers = lazy(() => import("./pages/Admin/ManageUsers"));  
const SystemReports = lazy(() => import("./pages/Admin/SystemReports"));
const DoctorApprovals = lazy(() => import("./pages/Admin/DoctorApprovals"));  
const Analytics = lazy(() => import("./pages/Admin/Analytics"));
const DoctorPatientChat = lazy(() => import("./components/Chat/DoctorPatientChat"));


// Routes array
const routes = [
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/doctor-dashboard", element: <DoctorDashboardPage /> },
  { path: "/admin-dashboard", element: <AdminDashboard /> },
  { path: "/account-selection", element: <AccountSelection /> },
  { path: "/create-child-profile", element: <CreateChildProfilePage /> },
  { path: "/documents", element: <Documents /> },
  { path: "/education", element: <Education /> },
  { path: "/home", element: <HomePage /> },
  { path: "/growth-tracker", element: <GrowthTracker /> },
  { path: "/medicines", element: <Medicines /> },
  { path: "/prescriptions", element: <Prescriptions /> },
  { path: "/immunizations", element: <Immunization /> },
  { path: "/medical-reports", element: <MedicalReports /> },
  { path: "/doctor-connection", element: <DrConnectionWithChild /> },
  { path: "/parenting-tips", element: <ParentingTips /> },
  { path: "/patient-details", element: <PatientDetailsPage /> },
  { path: "/patients", element: <MyPatientsPage />},
  { path: "/family-calendar", element: <FamilyCalendar /> },
  { path: "/family-expenses", element: <Expenses /> },
  { path: "/shopping", element: <Shopping /> },
  { path: "/album", element: <AlbumPage /> },
  { path: "/utility-lists", element: <UtilityLists /> },
  { path: "/prescribe-patient", element: <PrescribePatientPage /> },
  { path : "/feedback", element:<FeedbackPage />},
  { path : "/manage-users", element:<ManageUsers />}, 
  { path : "/system-reports", element:<SystemReports />}, 
  { path : "/doctor-approvals", element:<DoctorApprovals />},
  { path : "/analytics", element:<Analytics />},
  { path : "/doctor-patient-chat", element:<DoctorPatientChat />},


  { path: "*", element: <NotFoundPage /> },
];

export { routes };
