import { useRef, useEffect } from "react";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

export default function TerminalWindow({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isMinimized,
  isFullscreen,
  onDragStart,
  onDrag,
  onDragEnd,
  onResize,
  onMinimize,
  onClose,
  onFullscreen,
  onFocus,
}) {
  const windowRef = useRef(null);
  const headerRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDirection = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest(".terminal-dot")) return;
    if (e.target.closest(".resize-handle")) return;
    if (isFullscreen) return;
    isDragging.current = true;
    // Use getBoundingClientRect to get actual pixel position (handles CSS viewport units)
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    onFocus(id);
    onDragStart(id);
    e.preventDefault();
  };

  const initialWindowPos = useRef({ x: 0, y: 0 });

  const handleResizeMouseDown = (e, direction) => {
    if (isFullscreen) return;
    e.stopPropagation();
    isResizing.current = true;
    resizeDirection.current = direction;
    initialSize.current = { width: size.width, height: size.height };
    initialPos.current = { x: e.clientX, y: e.clientY };
    // Store initial window position for left/top resize
    const rect = windowRef.current.getBoundingClientRect();
    initialWindowPos.current = { x: rect.left, y: rect.top };
    onFocus(id);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current) {
        onDrag(id, {
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      } else if (isResizing.current) {
        const deltaX = e.clientX - initialPos.current.x;
        const deltaY = e.clientY - initialPos.current.y;
        const dir = resizeDirection.current;

        let newWidth = initialSize.current.width;
        let newHeight = initialSize.current.height;
        let newX = initialWindowPos.current.x;
        let newY = initialWindowPos.current.y;

        if (dir.includes("e")) {
          newWidth = Math.max(MIN_WIDTH, initialSize.current.width + deltaX);
        }
        if (dir.includes("w")) {
          const potentialWidth = initialSize.current.width - deltaX;
          if (potentialWidth >= MIN_WIDTH) {
            newWidth = potentialWidth;
            newX = initialWindowPos.current.x + deltaX;
          } else {
            newWidth = MIN_WIDTH;
            newX =
              initialWindowPos.current.x +
              (initialSize.current.width - MIN_WIDTH);
          }
        }
        if (dir.includes("s")) {
          newHeight = Math.max(MIN_HEIGHT, initialSize.current.height + deltaY);
        }
        if (dir.includes("n")) {
          const potentialHeight = initialSize.current.height - deltaY;
          if (potentialHeight >= MIN_HEIGHT) {
            newHeight = potentialHeight;
            newY = initialWindowPos.current.y + deltaY;
          } else {
            newHeight = MIN_HEIGHT;
            newY =
              initialWindowPos.current.y +
              (initialSize.current.height - MIN_HEIGHT);
          }
        }

        const positionChanged = dir.includes("w") || dir.includes("n");
        onResize(
          id,
          { width: newWidth, height: newHeight },
          positionChanged ? { x: newX, y: newY } : null
        );
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onDragEnd(id);
      }
      if (isResizing.current) {
        isResizing.current = false;
        resizeDirection.current = null;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [id, onDrag, onDragEnd, onResize]);

  if (isMinimized) return null;

  const windowStyle = isFullscreen
    ? {
        position: "fixed",
        left: 0,
        top: 28,
        right: 0,
        bottom: 0,
        zIndex: zIndex,
        width: "100%",
        height: "calc(100vh - 28px)",
      }
    : {
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: zIndex,
        width: size.width,
        height: size.height,
      };

  return (
    <div
      ref={windowRef}
      className={`terminal-window terminal-window-draggable ${
        isFullscreen ? "terminal-window-fullscreen" : ""
      }`}
      style={windowStyle}
      onMouseDown={() => onFocus(id)}
    >
      <div
        ref={headerRef}
        className={`terminal-header ${
          isFullscreen ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onFullscreen(id)}
      >
        <div className="terminal-header-dots">
          <div
            className="terminal-dot terminal-dot-red cursor-pointer hover:brightness-110"
            onClick={() => onClose(id)}
            title="Close"
          ></div>
          <div
            className="terminal-dot terminal-dot-yellow cursor-pointer hover:brightness-110"
            onClick={() => onMinimize(id)}
            title="Minimize"
          ></div>
          <div
            className="terminal-dot terminal-dot-green cursor-pointer hover:brightness-110"
            onClick={() => onFullscreen(id)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          ></div>
        </div>
        <span className="ml-4 text-sm text-[#888] select-none">{title}</span>
      </div>
      <div
        className={`p-6 overflow-auto ${
          isFullscreen ? "h-[calc(100%-48px)]" : "h-[calc(100%-48px)]"
        }`}
      >
        {children}
      </div>
      {!isFullscreen && (
        <>
          {/* Edge handles */}
          <div
            className="resize-handle absolute top-0 left-2 right-2 h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
          <div
            className="resize-handle absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
          <div
            className="resize-handle absolute left-0 top-2 bottom-2 w-2 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="resize-handle absolute right-0 top-2 bottom-2 w-2 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />
          {/* Corner handles */}
          <div
            className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />
        </>
      )}
    </div>
  );
}
