# Raikhen

A cyberpunk-themed interactive portfolio website for **Raikhen LLC**, an AI consulting and software development company. Features a macOS-style desktop interface with draggable windows, a Matrix rain background, and an AI-powered terminal assistant.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## Features

- **Desktop Environment** — macOS-inspired interface with window management (drag, resize, minimize, fullscreen, close)
- **Matrix Rain** — Animated falling code background effect
- **Interactive Terminal** — Bash-like shell with command history and AI chat mode
- **AI Assistant** — Powered by Claude via Anthropic SDK with streaming responses
- **Services Showcase** — AI Consulting, Custom Software, ML Integration
- **Contact Form** — Email functionality via Resend

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Environment Variables

Create a `.env.local` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
RESEND_API_KEY=your_resend_api_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Production Build

```bash
npm run build
npm start
```

## Terminal Commands

The interactive terminal supports bash-like commands:

| Command | Description                       |
| ------- | --------------------------------- |
| `help`  | Show available commands           |
| `ask`   | Enter AI chat mode                |
| `ls`    | List directory contents           |
| `cd`    | Change directory                  |
| `cat`   | Display file contents             |
| `pwd`   | Print working directory           |
| `clear` | Clear terminal                    |
| `exit`  | Exit chat mode (when in ask mode) |

**Tip:** Use arrow keys to navigate command history.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI:** [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com)
- **AI:** [Anthropic SDK](https://docs.anthropic.com) (Claude)
- **Email:** [Resend](https://resend.com)

## Project Structure

```
app/
├── api/
│   ├── chat/         # AI chat endpoint
│   └── contact/      # Contact form endpoint
├── components/
│   ├── content/      # Window content components
│   ├── Desktop.js    # Desktop background + Matrix rain
│   ├── Dock.js       # macOS-style dock
│   ├── MenuBar.js    # Top menu bar
│   ├── WindowManager.js
│   ├── TerminalWindow.js
│   └── InteractiveTerminal.js
├── lib/
│   ├── bashInterpreter.js
│   └── fileSystem.js
└── page.js
```

## License

© 2026 Raikhen LLC. All rights reserved.
