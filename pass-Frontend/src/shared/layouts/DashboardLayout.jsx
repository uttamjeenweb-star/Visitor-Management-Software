import { Outlet, Link } from "react-router-dom";
import { Navbar } from "@/shared/ui/organisms/Navbar";
import { Sidebar, SidebarItem, SidebarGroup } from "@/shared/ui/organisms/Sidebar";
import { Footer } from "@/shared/ui/organisms/Footer";
import { NotificationBell } from "@/shared/components/NotificationBell";
import { UserProfilePanel } from "@/shared/components/UserProfilePanel";
import { useState } from "react";
import {
  Package,
  LogOut,
  UserRoundCog,
  Factory,
  FilePlus,
  Users,
  DoorOpen,
  Presentation,
  Settings,
  Building,
  Network,
  Map,
  IdCard,
  FileText,
  Calendar,
  Printer,
  Sliders,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { useAuth } from "@/features/auth/AuthContext";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const hasAccess = (moduleName) => {
    if (user?.role === "Super Admin") return true;
    const p = user?.roleRef?.permissions?.find(p => p.module === moduleName);
    return !!(p && (p.canRead || p.canCreate || p.canUpdate || Object.values(p.dashboardActions || {}).some(v => v)));
  };
  
  return (
    <div className="dashboard-layout">
      {
        <Navbar>
          {
            <div className="dashboard-navbar-content">
              {<div className="dashboard-logo">VMS</div>}
              {
                <div className="dashboard-actions flex items-center space-x-4">
                  <NotificationBell />
                  {
                    <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                      {<LogOut className="dashboard-icon" />}
                    </Button>
                  }
                  <div className="cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                    <Avatar fallback="US" />
                  </div>
                </div>
              }
            </div>
          }
        </Navbar>
      }
      {
        <div className="dashboard-body">
          {
            <Sidebar>
              {hasAccess("Dashboard") && (
                <Link to="/dashboard">
                  <SidebarItem icon={Presentation} label="Dashboard" />
                </Link>
              )}

              {hasAccess("Dashboard") && (
                <Link to="/create-pass">
                  <SidebarItem icon={FilePlus} label="Create Pass" />
                </Link>
              )}

              <SidebarGroup icon={Settings} label="Master Settings">
                {hasAccess("Role") && (
                  <Link to="/role-config">
                    <SidebarItem icon={Users} label="Roles & Permissions" />
                  </Link>
                )}
                {hasAccess("CompanyRegister") && (
                  <Link to="/company-register-config">
                    <SidebarItem icon={Building} label="Company Register" />
                  </Link>
                )}
                {hasAccess("Department") && (
                  <Link to="/department-config">
                    <SidebarItem icon={Network} label="Department" />
                  </Link>
                )}
                {hasAccess("Employee") && (
                  <Link to="/employee-config">
                    <SidebarItem icon={UserRoundCog} label="Employee" />
                  </Link>
                )}
                {hasAccess("VisitingArea") && (
                  <Link to="/visiting-area-config">
                    <SidebarItem icon={Factory} label="Visiting Area" />
                  </Link>
                )}
                {hasAccess("Location") && (
                  <Link to="/location-config">
                    <SidebarItem icon={Map} label="Location" />
                  </Link>
                )}
                {hasAccess("VisitorType") && (
                  <Link to="/visitor-type-config">
                    <SidebarItem icon={Users} label="Visitor Type" />
                  </Link>
                )}
                {hasAccess("Purpose") && (
                  <Link to="/purpose-config">
                    <SidebarItem icon={DoorOpen} label="Purpose" />
                  </Link>
                )}
                {hasAccess("IdType") && (
                  <Link to="/id-type-config">
                    <SidebarItem icon={IdCard} label="Id Type" />
                  </Link>
                )}
                {hasAccess("CarryWith") && (
                  <Link to="/carry-with-config">
                    <SidebarItem icon={Package} label="Carry With" />
                  </Link>
                )}
              </SidebarGroup>

              <SidebarGroup icon={FileText} label="Reports">
                {hasAccess("Report") && (
                  <>
                    <Link to="/report/generate">
                      <SidebarItem icon={FilePlus} label="Generate Report" />
                    </Link>
                    <Link to="/report/today">
                      <SidebarItem icon={Calendar} label="Inside Report" />
                    </Link>
                  </>
                )}
              </SidebarGroup>

              <SidebarGroup icon={Printer} label="Print Settings">
                {hasAccess("Print") && (
                  <>
                    <Link to="/report/print-pass">
                      <SidebarItem icon={Printer} label="Print Pass by ID" />
                    </Link>
                    <Link to="/report/print-settings">
                      <SidebarItem icon={Sliders} label="Print Setting" />
                    </Link>
                  </>
                )}
              </SidebarGroup>
            </Sidebar>
          }
          
          <main className="dashboard-main">
            <div className="dashboard-content">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      }
      <UserProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
