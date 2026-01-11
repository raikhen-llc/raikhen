export default function Dock({
  windows,
  onRestore,
  onFocus,
  onCreateTerminal,
}) {
  const staticWindows = windows.filter((win) => !win.isDynamic);
  const dynamicWindows = windows.filter(
    (win) => win.isDynamic && !win.isClosed
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex gap-1 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#333] border-b-0 rounded-t-xl px-2 pt-2 pb-1 z-50">
      {staticWindows.map((win) => {
        const isOpen = !win.isClosed;

        const handleClick = () => {
          if (win.isClosed || win.isMinimized) {
            onRestore(win.id);
          } else {
            onFocus(win.id);
          }
        };

        return (
          <button
            key={win.id}
            onClick={handleClick}
            className="flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors hover:bg-[#333]/50"
            title={win.title}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono border bg-[#0a0a0a] border-[#444] text-[#00ff00]">
              {win.id === "welcome" && ">_"}
              {win.id === "services" && "{}"}
              {win.id === "contact" && "@"}
            </div>
            <span className="text-[10px] mt-1 text-[#888]">
              {win.title.split("/").pop()}
            </span>
            <div
              className={`w-1 h-1 rounded-full mt-0.5 transition-colors ${
                isOpen ? "bg-[#00ff00]" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-14 bg-[#333] mx-1 self-center" />

      {/* Dynamic terminal windows */}
      {dynamicWindows.map((win) => {
        const handleClick = () => {
          if (win.isMinimized) {
            onRestore(win.id);
          } else {
            onFocus(win.id);
          }
        };

        return (
          <button
            key={win.id}
            onClick={handleClick}
            className="flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors hover:bg-[#333]/50"
            title={win.title}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono border bg-[#0a0a0a] border-[#444] text-[#00ff00]">
              &gt;_
            </div>
            <span className="text-[10px] mt-1 text-[#888]">
              {win.title.split("/").pop()}
            </span>
            <div className="w-1 h-1 rounded-full mt-0.5 bg-[#00ff00]" />
          </button>
        );
      })}

      {/* New Terminal Button */}
      <button
        onClick={onCreateTerminal}
        className="flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors hover:bg-[#333]/50"
        title="New Terminal"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-mono border bg-[#0a0a0a] border-[#444] text-[#00ff00]">
          +
        </div>
        <span className="text-[10px] mt-1 text-[#888]">new</span>
        <div className="w-1 h-1 rounded-full mt-0.5 bg-transparent" />
      </button>
    </div>
  );
}
