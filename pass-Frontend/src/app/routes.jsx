import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/shared/components/PageLoader";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import { ProtectedRoute, GuestRoute, PermissionRoute } from "@/shared/components/guards";

// Lazy Loaded Pages
const CreatePassPage = lazy(() => import("@/pages/CreatePass"));
const EmployeePage = lazy(() => import("@/pages/EmployeePage").then(m => ({ default: m.EmployeePage })));
const RoleManagement = lazy(() => import("@/pages/Roles/RoleManagement").then(m => ({ default: m.RoleManagement })));
const CarryWithPage = lazy(() => import("@/pages/CarryWithPage").then(m => ({ default: m.CarryWithPage })));
const PurposePage = lazy(() => import("@/pages/PurposePage").then(m => ({ default: m.PurposePage })));
const VisitorAreaPage = lazy(() => import("@/pages/VisitingAreaPage").then(m => ({ default: m.VisitorAreaPage })));
const VisitorTypePage = lazy(() => import("@/pages/VisitorTypePage").then(m => ({ default: m.VisitorTypePage })));
const DepartmentPage = lazy(() => import("@/pages/DepartmentPage").then(m => ({ default: m.DepartmentPage })));
const CompanyRegisterPage = lazy(() => import("@/pages/CompanyRegisterPage").then(m => ({ default: m.CompanyRegisterPage })));
const LocationPage = lazy(() => import("@/pages/LocationPage").then(m => ({ default: m.LocationPage })));
const IdTypePage = lazy(() => import("@/pages/IdTypePage").then(m => ({ default: m.IdTypePage })));
const DashbordPage = lazy(() => import("@/pages/Dashboard"));
const ReportPage = lazy(() => import("@/pages/Report"));
const PassActionPage = lazy(() => import("@/pages/PassAction"));
const PrintPassByIdPage = lazy(() => import("@/pages/Report/PrintPassByIdPage"));
const PrintSettingsPage = lazy(() => import("@/pages/Report/PrintSettingsPage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage").then(m => ({ default: m.UnauthorizedPage })));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <GuestRoute />,
    children: [
      {
        path: "",
        element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>
      }
    ]
  },
  {
    path: "/unauthorized",
    element: <SuspenseWrapper><UnauthorizedPage /></SuspenseWrapper>
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "",
            element: <div className="text-2xl font-bold">Welcome to Dashboard</div>
          },
          {
            path: "dashboard",
            element: <SuspenseWrapper><DashbordPage /></SuspenseWrapper>
          },
          {
            path: "create-pass",
            element: <SuspenseWrapper><CreatePassPage /></SuspenseWrapper>
          },
          {
            path: "pass/:id/action",
            element: <SuspenseWrapper><PassActionPage /></SuspenseWrapper>
          },
          {
            path: "report/generate",
            element: <SuspenseWrapper><ReportPage mode="generate" /></SuspenseWrapper>
          },
          {
            path: "report/today",
            element: <SuspenseWrapper><ReportPage mode="today" /></SuspenseWrapper>
          },
          {
            path: "report/print-pass",
            element: <SuspenseWrapper><PrintPassByIdPage /></SuspenseWrapper>
          },
          {
            path: "report/print-settings",
            element: <SuspenseWrapper><PrintSettingsPage /></SuspenseWrapper>
          },
          // Master Settings & Role Permission Routes (Guarded by specific module permissions)
          {
            element: <PermissionRoute module="Role" />,
            children: [{ path: "role-config", element: <SuspenseWrapper><RoleManagement /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="Employee" />,
            children: [{ path: "employee-config", element: <SuspenseWrapper><EmployeePage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="Department" />,
            children: [{ path: "department-config", element: <SuspenseWrapper><DepartmentPage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="VisitingArea" />,
            children: [{ path: "visiting-area-config", element: <SuspenseWrapper><VisitorAreaPage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="VisitorType" />,
            children: [{ path: "visitor-type-config", element: <SuspenseWrapper><VisitorTypePage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="Purpose" />,
            children: [{ path: "purpose-config", element: <SuspenseWrapper><PurposePage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="CarryWith" />,
            children: [{ path: "carry-with-config", element: <SuspenseWrapper><CarryWithPage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="CompanyRegister" />,
            children: [{ path: "company-register-config", element: <SuspenseWrapper><CompanyRegisterPage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="Location" />,
            children: [{ path: "location-config", element: <SuspenseWrapper><LocationPage /></SuspenseWrapper> }]
          },
          {
            element: <PermissionRoute module="IdType" />,
            children: [{ path: "id-type-config", element: <SuspenseWrapper><IdTypePage /></SuspenseWrapper> }]
          }
        ]
      }
    ]
  }
]);
