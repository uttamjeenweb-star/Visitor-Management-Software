import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Sidebar = ({ className, children }) => {
  return (
    <div className={cn("sidebar", className)}>
      <div className="sidebar-nav">{children}</div>
    </div>
  );
};

export const SidebarItem = ({ icon: Icon, label, isActive }) => {
  return (
    <div
      className={cn(
        "sidebar-item",
        isActive ? "sidebar-item-active" : "sidebar-item-inactive"
      )}
    >
      {Icon && <Icon className="sidebar-item-icon" />}
      {label}
    </div>
  );
};

export const SidebarGroup = ({ icon: Icon, label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        className={cn("sidebar-item", open ? "sidebar-item-active" : "sidebar-item-inactive")}
        onClick={() => setOpen((prev) => !prev)}
        style={{ cursor: "pointer" }}
      >
        {Icon && <Icon className="sidebar-item-icon" />}
        <span style={{ flex: 1 }}>{label}</span>
        <ChevronDown
          className="sidebar-item-icon"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {open && (
        <div className="sidebar-group-children">
          {children}
        </div>
      )}
    </div>
  );
};