"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { executeCommand, getPrompt } from "../lib/bashInterpreter";

// Welcome segments with colors for streaming effect
const WELCOME_SEGMENTS = [
  {
    text: "╔═══════════════════════════════════════════════════════════════╗\n",
    color: "#ff6b9d",
  },
  { text: "║", color: "#ff6b9d" },
  { text: "                      Welcome to ", color: "#888" },
  { text: "RAIKHEN", color: "#00ffff", bold: true },
  { text: "                       ", color: "#888" },
  { text: "║\n", color: "#ff6b9d" },
  { text: "║", color: "#ff6b9d" },
  {
    text: "                 AI Consulting & Development                   ",
    color: "#888",
  },
  { text: "║\n", color: "#ff6b9d" },
  {
    text: "╚═══════════════════════════════════════════════════════════════╝\n\n",
    color: "#ff6b9d",
  },
  { text: "  ✨ ", color: "#ffd93d" },
  { text: "AI Consulting", color: "#00ff88" },
  { text: "      → Strategic AI adoption & roadmaps\n", color: "#888" },
  { text: "  🚀 ", color: "#ffd93d" },
  { text: "Custom Software", color: "#00ff88" },
  { text: "    → React, Next.js, Node, Mobile\n", color: "#888" },
  { text: "  🧠 ", color: "#ffd93d" },
  { text: "ML Integration", color: "#00ff88" },
  { text: "     → Models, APIs, MLOps\n\n", color: "#888" },
  {
    text: "─────────────────────────────────────────────────────────────────\n",
    color: "#444",
  },
  { text: "Type your question below", color: "#888" },
  { text: " • ", color: "#444" },
  { text: "'exit'", color: "#ff6b6b" },
  { text: " for shell", color: "#888" },
  { text: " • ", color: "#444" },
  { text: "'help'", color: "#00ffff" },
  { text: " for commands\n", color: "#888" },
  {
    text: "─────────────────────────────────────────────────────────────────\n",
    color: "#444",
  },
];

const INITIAL_GREETING =
  "Hi! I'm Raikhen's AI assistant. How can I help you today?";

const ASK_MODE_INTRO = `Entering chat mode. Type 'exit' to return to shell.

`;

export default function InteractiveTerminal({
  startInAskMode = false,
  initialCommand = null,
}) {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [isAskMode, setIsAskMode] = useState(startInAskMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [initialized, setInitialized] = useState(false);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Stream welcome message effect
  const streamWelcomeMessage = useCallback(async () => {
    setIsStreaming(true);

    // Stream colored segments
    for (let i = 0; i < WELCOME_SEGMENTS.length; i++) {
      const segment = WELCOME_SEGMENTS[i];
      const chars = segment.text.split("");

      for (let j = 0; j < chars.length; j++) {
        await new Promise((resolve) => setTimeout(resolve, 8));
        setLines((prev) => {
          const newLines = [...prev];
          const lastLine = newLines[newLines.length - 1];

          if (lastLine && lastLine.type === "styled-stream") {
            // Append to existing styled stream line
            return [
              ...newLines.slice(0, -1),
              {
                ...lastLine,
                segments: [
                  ...lastLine.segments.slice(0, -1),
                  {
                    ...lastLine.segments[lastLine.segments.length - 1],
                    text:
                      lastLine.segments[lastLine.segments.length - 1].text +
                      chars[j],
                  },
                ],
              },
            ];
          } else {
            // Create new styled stream line
            return [
              ...newLines,
              {
                type: "styled-stream",
                segments: [
                  { text: chars[j], color: segment.color, bold: segment.bold },
                ],
              },
            ];
          }
        });
      }

      // Add new segment with different color
      if (i < WELCOME_SEGMENTS.length - 1) {
        setLines((prev) => {
          const newLines = [...prev];
          const lastLine = newLines[newLines.length - 1];
          if (lastLine && lastLine.type === "styled-stream") {
            return [
              ...newLines.slice(0, -1),
              {
                ...lastLine,
                segments: [
                  ...lastLine.segments,
                  {
                    text: "",
                    color: WELCOME_SEGMENTS[i + 1].color,
                    bold: WELCOME_SEGMENTS[i + 1].bold,
                  },
                ],
              },
            ];
          }
          return newLines;
        });
      }
    }

    // Add blank line
    setLines((prev) => [...prev, { type: "output", text: "" }]);

    // Stream the greeting
    const greetingChars = INITIAL_GREETING.split("");
    setLines((prev) => [
      ...prev,
      { type: "assistant", text: "", isStreaming: true },
    ]);

    for (let i = 0; i < greetingChars.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setLines((prev) => {
        const newLines = [...prev];
        const lastIdx = newLines.length - 1;
        if (newLines[lastIdx]?.isStreaming) {
          newLines[lastIdx] = {
            ...newLines[lastIdx],
            text: newLines[lastIdx].text + greetingChars[i],
          };
        }
        return [...newLines];
      });
    }

    // Mark streaming complete
    setLines((prev) => {
      const newLines = [...prev];
      const lastIdx = newLines.length - 1;
      if (newLines[lastIdx]?.isStreaming) {
        newLines[lastIdx] = { ...newLines[lastIdx], isStreaming: false };
      }
      return [...newLines];
    });

    setChatHistory([{ role: "assistant", content: INITIAL_GREETING }]);
    setIsStreaming(false);
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (startInAskMode) {
      streamWelcomeMessage();
    } else {
      setLines([
        {
          type: "system",
          text: `Raikhen Terminal v1.0\nType 'help' for available commands.\n`,
        },
      ]);

      // Execute initial command if provided
      if (initialCommand) {
        const prompt = getPrompt();
        setLines((prev) => [
          ...prev,
          { type: "input", text: `${prompt}${initialCommand}` },
        ]);

        const result = executeCommand(initialCommand);

        if (result.enterAskMode) {
          setIsAskMode(true);
          setLines((prev) => [
            ...prev,
            { type: "system", text: ASK_MODE_INTRO },
            {
              type: "assistant",
              text: "Hi! I'm Raikhen's AI assistant. How can I help you today?",
            },
          ]);
          setChatHistory([
            {
              role: "assistant",
              content:
                "Hi! I'm Raikhen's AI assistant. How can I help you today?",
            },
          ]);
        } else if (result.output) {
          setLines((prev) => [
            ...prev,
            { type: result.isError ? "error" : "output", text: result.output },
          ]);
        }
      }
    }
  }, [startInAskMode, initialized, streamWelcomeMessage, initialCommand]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Listen for paste events from menu bar
  useEffect(() => {
    const handlePaste = (e) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        const text = e.detail?.text || "";
        setInput((prev) => prev + text);
      }
    };

    window.addEventListener("terminal-paste", handlePaste);
    return () => window.removeEventListener("terminal-paste", handlePaste);
  }, []);

  const sendChatMessage = async (userMessage) => {
    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: userMessage },
    ];
    setChatHistory(newChatHistory);
    setIsLoading(true);
    setIsStreaming(true);

    // Add an empty assistant line for streaming
    setLines((prev) => [
      ...prev,
      { type: "assistant", text: "", isStreaming: true },
    ]);
    let fullMessage = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newChatHistory, stream: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines_chunk = chunk.split("\n");

        for (const line of lines_chunk) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullMessage += parsed.text;
                setLines((prev) => {
                  const newLines = [...prev];
                  const lastIdx = newLines.length - 1;
                  if (newLines[lastIdx]?.isStreaming) {
                    newLines[lastIdx] = {
                      ...newLines[lastIdx],
                      text: fullMessage,
                    };
                  }
                  return [...newLines];
                });
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      // Mark streaming complete
      setLines((prev) => {
        const newLines = [...prev];
        const lastIdx = newLines.length - 1;
        if (newLines[lastIdx]?.isStreaming) {
          newLines[lastIdx] = { ...newLines[lastIdx], isStreaming: false };
        }
        return [...newLines];
      });

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: fullMessage },
      ]);
    } catch (error) {
      setLines((prev) => {
        // Remove the streaming line and add error
        const newLines = prev.filter((l) => !l.isStreaming);
        return [
          ...newLines,
          {
            type: "error",
            text: `[Error] ${
              error.message || "Failed to connect to AI service."
            }`,
          },
        ];
      });
    }

    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput && !isAskMode) return;
    if (isLoading) return;

    // Add to command history
    if (trimmedInput) {
      setCommandHistory((prev) => [...prev, trimmedInput]);
      setHistoryIndex(-1);
    }

    if (isAskMode) {
      // Handle ask mode
      if (trimmedInput.toLowerCase() === "exit") {
        setIsAskMode(false);
        setChatHistory([]);
        setLines((prev) => [
          ...prev,
          { type: "input", text: `> ${trimmedInput}` },
          { type: "system", text: "\nExiting chat mode.\n" },
        ]);
        setInput("");
        return;
      }

      if (trimmedInput.toLowerCase() === "clear") {
        setLines([]);
        setInput("");
        return;
      }

      // Add user message to lines
      setLines((prev) => [
        ...prev,
        { type: "input", text: `> ${trimmedInput}` },
      ]);
      setInput("");

      if (trimmedInput) {
        await sendChatMessage(trimmedInput);
      }
    } else {
      // Handle shell mode
      const prompt = getPrompt();
      setLines((prev) => [
        ...prev,
        { type: "input", text: `${prompt}${trimmedInput}` },
      ]);
      setInput("");

      const result = executeCommand(trimmedInput);

      if (result.shouldClear) {
        setLines([]);
        return;
      }

      if (result.enterAskMode) {
        setIsAskMode(true);
        setLines((prev) => [
          ...prev,
          { type: "system", text: ASK_MODE_INTRO },
          {
            type: "assistant",
            text: "Hi! I'm Raikhen's AI assistant. How can I help you today?",
          },
        ]);
        setChatHistory([
          {
            role: "assistant",
            content:
              "Hi! I'm Raikhen's AI assistant. How can I help you today?",
          },
        ]);
        return;
      }

      if (result.output) {
        setLines((prev) => [
          ...prev,
          { type: result.isError ? "error" : "output", text: result.output },
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+L to clear terminal
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setLines([]);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const getPromptText = () => {
    if (isAskMode) {
      return "> ";
    }
    return getPrompt();
  };

  const renderLine = (line, idx) => {
    if (line.type === "styled-stream") {
      return (
        <div key={idx}>
          <pre className="whitespace-pre-wrap wrap-break-word m-0">
            {line.segments.map((seg, segIdx) => (
              <span
                key={segIdx}
                style={{
                  color: seg.color,
                  fontWeight: seg.bold ? "bold" : "normal",
                }}
              >
                {seg.text}
              </span>
            ))}
          </pre>
        </div>
      );
    }

    return (
      <div key={idx} className={getLineClass(line.type)}>
        <pre className="whitespace-pre-wrap wrap-break-word m-0">
          {line.text}
          {line.isStreaming && <span className="animate-pulse">▊</span>}
        </pre>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-sm cursor-text"
      onClick={handleContainerClick}
    >
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-1 pb-2">
        {lines.map((line, idx) => renderLine(line, idx))}
        {isLoading && !isStreaming && (
          <div className="text-[#888]">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <span className={isAskMode ? "text-[#00ffff]" : "text-[#888]"}>
          {getPromptText()}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isStreaming}
          className="terminal-input flex-1 bg-transparent border-none outline-none text-[#00ff00] caret-[#00ff00]"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}

function getLineClass(type) {
  switch (type) {
    case "input":
      return "text-[#888]";
    case "output":
      return "text-[#00aa00]";
    case "error":
      return "text-[#ff6b6b]";
    case "assistant":
      return "text-[#00ffff]";
    case "system":
      return "text-[#888]";
    default:
      return "text-[#00aa00]";
  }
}
