import React from "react";

export default function ToggleSidebarIcon({ size = 24, className = "", collapsed = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sidebar Rectangle */}
      <rect x="3" y="4" width="6" height="16" rx="1.5" />
      
      {/* Main Content Rectangle */}
      <rect x="11" y="4" width="10" height="16" rx="1.5" />
      
      {/* Expand/Collapse Arrows */}
      {collapsed ? (
        <path d="M5.5 15l2.5-3-2.5-3" />
      ) : (
        <path d="M6.5 15l-2.5-3 2.5-3" />
      )}
    </svg>
  );
}
