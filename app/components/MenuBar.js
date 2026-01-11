"use client";

import { useState, useEffect, useRef } from "react";

export default function MenuBar({
  windows,
  onReopen,
  onMinimize,
  onClose,
  onCreateTerminal,
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const openWindows = windows.filter((w) => !w.isClosed);

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  const MenuButton = ({ name, children }) => (
    <div className="relative">
      <button
        className={`font-mono text-[13px] px-2.5 py-0.5 rounded ${
          activeMenu === name
            ? "bg-[#1a3a1a] text-[#00ff00]"
            : "text-[#888] hover:bg-[#252525]"
        }`}
        onClick={() => handleMenuClick(name)}
      >
        {name}
      </button>
      {activeMenu === name && (
        <div className="absolute top-full left-0 mt-0.5 bg-[#1a1a1a] border border-[#333] rounded-md py-1 min-w-[200px] shadow-xl font-mono">
          {children}
        </div>
      )}
    </div>
  );

  const MenuItem = ({ onClick, disabled, shortcut, children }) => (
    <button
      className={`w-full text-left px-3 py-1 text-[13px] flex items-center justify-between ${
        disabled
          ? "text-[#444] cursor-default"
          : "text-[#888] hover:bg-[#1a3a1a] hover:text-[#00ff00]"
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      {shortcut && <span className="text-[11px] text-[#555]">{shortcut}</span>}
    </button>
  );

  const MenuDivider = () => <div className="border-t border-[#333] my-1" />;

  const handleWindowToggle = (win) => {
    if (win.isClosed || win.isMinimized) {
      onReopen(win.id);
    } else {
      onMinimize(win.id);
    }
    setActiveMenu(null);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#252525] flex items-center px-2 z-[100] font-mono">
      <span className="text-[#00ff00] font-bold text-[13px] px-2">
        Raikhen OS
      </span>

      <div ref={menuRef} className="flex items-center gap-0.5 ml-2">
        <MenuButton name="Window">
          <MenuItem
            onClick={() => {
              onCreateTerminal();
              setActiveMenu(null);
            }}
          >
            New Window
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => {
              const topWindow = openWindows.reduce(
                (top, w) =>
                  !w.isMinimized && w.zIndex > (top?.zIndex || 0) ? w : top,
                null
              );
              if (topWindow) {
                onMinimize(topWindow.id);
                setActiveMenu(null);
              }
            }}
            disabled={openWindows.filter((w) => !w.isMinimized).length === 0}
          >
            Minimize
          </MenuItem>
          <MenuItem
            onClick={() => {
              const topWindow = openWindows.reduce(
                (top, w) =>
                  !w.isMinimized && w.zIndex > (top?.zIndex || 0) ? w : top,
                null
              );
              if (topWindow) {
                onClose(topWindow.id);
                setActiveMenu(null);
              }
            }}
            disabled={openWindows.filter((w) => !w.isMinimized).length === 0}
          >
            Close
          </MenuItem>
          <MenuDivider />
          {windows.map((win) => (
            <MenuItem key={win.id} onClick={() => handleWindowToggle(win)}>
              <span className="flex items-center gap-2">
                {!win.isClosed && !win.isMinimized && (
                  <span className="text-[#00ff00]">●</span>
                )}
                {(win.isClosed || win.isMinimized) && (
                  <span className="text-[#333]">○</span>
                )}
                {win.title.split("/").pop()}
              </span>
            </MenuItem>
          ))}
        </MenuButton>

        <MenuButton name="Help">
          <MenuItem
            onClick={() => {
              onCreateTerminal({ title: "help", initialCommand: "help" });
              setActiveMenu(null);
            }}
          >
            See Commands
          </MenuItem>
          <MenuItem
            onClick={() => {
              onCreateTerminal({ title: "assistant", initialCommand: "ask" });
              setActiveMenu(null);
            }}
          >
            Ask Assistant
          </MenuItem>
        </MenuButton>
      </div>

      <div className="ml-auto text-[#555] text-[12px] pr-2">
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
