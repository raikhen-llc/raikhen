"use client";

import { useState, useCallback } from "react";
import TerminalWindow from "./TerminalWindow";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import InteractiveTerminal from "./InteractiveTerminal";
import ServicesContent from "./content/ServicesContent";
import ContactContent from "./content/ContactContent";

const WINDOW_CONFIGS = [
  {
    id: "welcome",
    title: "welcome",
    contentType: "interactive-terminal",
    startInAskMode: true,
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: "calc(5vw)", y: "calc(28px + 5vh)" },
  },
  {
    id: "services",
    title: "services",
    contentType: "component",
    content: ServicesContent,
    defaultSize: { width: 590, height: 580 },
    defaultPosition: { x: "calc(100vw - 590px - 5vw)", y: "calc(28px + 10vh)" },
  },
  {
    id: "contact",
    title: "contact",
    contentType: "component",
    content: ContactContent,
    defaultSize: { width: 800, height: 570 },
    defaultPosition: {
      x: "calc(50vw - 400px)",
      y: "calc(100vh - 570px - 100px)",
    },
  },
];

let windowCounter = 0;

export default function WindowManager() {
  const initialZIndexes = { welcome: 3, contact: 2, services: 1 };
  const [windows, setWindows] = useState(() =>
    WINDOW_CONFIGS.map((win) => ({
      ...win,
      position: win.defaultPosition,
      size: win.defaultSize,
      zIndex: initialZIndexes[win.id] || 1,
      isMinimized: false,
      isClosed: false,
      isFullscreen: false,
      isDynamic: false,
    }))
  );
  const [highestZ, setHighestZ] = useState(WINDOW_CONFIGS.length);

  const handleDragStart = useCallback(() => {}, []);

  const handleDrag = useCallback((id, newPosition) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, position: newPosition } : win
      )
    );
  }, []);

  const handleDragEnd = useCallback(() => {}, []);

  const handleFocus = useCallback(
    (id) => {
      setHighestZ((prev) => prev + 1);
      setWindows((prevWindows) =>
        prevWindows.map((win) =>
          win.id === id ? { ...win, zIndex: highestZ + 1 } : win
        )
      );
    },
    [highestZ]
  );

  const handleMinimize = useCallback((id) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isMinimized: true, isFullscreen: false } : win
      )
    );
  }, []);

  const handleRestore = useCallback(
    (id) => {
      setHighestZ((prev) => prev + 1);
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id
            ? { ...win, isMinimized: false, zIndex: highestZ + 1 }
            : win
        )
      );
    },
    [highestZ]
  );

  const handleClose = useCallback((id) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isClosed: true, isFullscreen: false } : win
      )
    );
  }, []);

  const handleFullscreen = useCallback(
    (id) => {
      setHighestZ((prev) => prev + 1);
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id
            ? { ...win, isFullscreen: !win.isFullscreen, zIndex: highestZ + 1 }
            : win
        )
      );
    },
    [highestZ]
  );

  const handleReopen = useCallback(
    (id) => {
      setHighestZ((prev) => prev + 1);
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id
            ? {
                ...win,
                isClosed: false,
                isMinimized: false,
                zIndex: highestZ + 1,
              }
            : win
        )
      );
    },
    [highestZ]
  );

  const handleResize = useCallback((id, newSize, newPosition) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? {
              ...win,
              size: newSize,
              ...(newPosition && { position: newPosition }),
            }
          : win
      )
    );
  }, []);

  const createNewTerminal = useCallback(
    (options = {}) => {
      windowCounter++;
      const newId = `terminal-${windowCounter}`;
      const offset = (windowCounter % 5) * 30;

      const title = options.title || `~ (${windowCounter})`;

      setHighestZ((prev) => prev + 1);
      setWindows((prev) => [
        ...prev,
        {
          id: newId,
          title,
          contentType: "interactive-terminal",
          startInAskMode: options.startInAskMode || false,
          initialCommand: options.initialCommand || null,
          position: { x: 100 + offset, y: 100 + offset },
          size: { width: 700, height: 500 },
          zIndex: highestZ + 1,
          isMinimized: false,
          isClosed: false,
          isFullscreen: false,
          isDynamic: true,
        },
      ]);
    },
    [highestZ]
  );

  const handleCloseDynamic = useCallback((id) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (win?.isDynamic) {
        // Remove dynamic windows completely
        return prev.filter((w) => w.id !== id);
      }
      // Just mark static windows as closed
      return prev.map((w) =>
        w.id === id ? { ...w, isClosed: true, isFullscreen: false } : w
      );
    });
  }, []);

  const visibleWindows = windows.filter((win) => !win.isClosed);

  const renderWindowContent = (win) => {
    if (win.contentType === "interactive-terminal") {
      return (
        <InteractiveTerminal
          key={win.id}
          startInAskMode={win.startInAskMode}
          initialCommand={win.initialCommand}
        />
      );
    }
    if (win.contentType === "component" && win.content) {
      const ContentComponent = win.content;
      return <ContentComponent />;
    }
    return null;
  };

  return (
    <>
      <MenuBar
        windows={windows}
        onReopen={handleReopen}
        onMinimize={handleMinimize}
        onClose={handleCloseDynamic}
        onCreateTerminal={createNewTerminal}
      />
      {visibleWindows.map((win) => (
        <TerminalWindow
          key={win.id}
          id={win.id}
          title={win.title}
          position={win.position}
          size={win.size}
          zIndex={win.zIndex}
          isMinimized={win.isMinimized}
          isFullscreen={win.isFullscreen}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onResize={handleResize}
          onMinimize={handleMinimize}
          onClose={() => handleCloseDynamic(win.id)}
          onFullscreen={handleFullscreen}
          onFocus={handleFocus}
        >
          {renderWindowContent(win)}
        </TerminalWindow>
      ))}
      <Dock
        windows={windows}
        onRestore={handleReopen}
        onFocus={handleFocus}
        onCreateTerminal={createNewTerminal}
      />
    </>
  );
}
