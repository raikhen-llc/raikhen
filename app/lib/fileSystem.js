const STORAGE_KEY = "raikhen-fs";

const DEFAULT_FILE_SYSTEM = {
  "/": {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          user: {
            type: "dir",
            children: {
              "welcome.txt": {
                type: "file",
                content: `Welcome to Raikhen Terminal!

I'm an AI assistant here to help you learn about our services.
Feel free to ask me anything about:
  - AI Consulting
  - Custom Software Development
  - Machine Learning Integration

Just type your question and press Enter.
Type 'exit' to leave chat mode and explore the file system.
Type 'help' for available commands.`,
              },
              services: {
                type: "dir",
                children: {
                  "ai-consulting.txt": {
                    type: "file",
                    content: `AI Consulting Services
======================

Strategic guidance on AI adoption, from identifying opportunities 
to implementation planning.

We help you:
  - Assess AI readiness and opportunities
  - Develop AI strategy and roadmap
  - Select appropriate AI technologies
  - Plan implementation and integration
  - Measure ROI and optimize

Contact us to schedule a consultation.`,
                  },
                  "custom-software.txt": {
                    type: "file",
                    content: `Custom Software Development
===========================

Bespoke applications built to your exact specifications 
with modern technologies.

Our expertise includes:
  - Web applications (React, Next.js, Node.js)
  - Mobile applications (React Native, iOS, Android)
  - Backend systems and APIs
  - Database design and optimization
  - Cloud infrastructure (AWS, GCP, Azure)

Every project is tailored to your unique needs.`,
                  },
                  "ml-integration.txt": {
                    type: "file",
                    content: `Machine Learning Integration
============================

Seamlessly integrate machine learning models into your 
existing systems and workflows.

Services include:
  - Model selection and fine-tuning
  - API integration for ML services
  - Custom model development
  - MLOps and model deployment
  - Performance monitoring and optimization

Transform your data into actionable insights.`,
                  },
                },
              },
              "services.sh": {
                type: "file",
                content: `#!/bin/bash
# Raikhen Services
# Run this script to view available services

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    RAIKHEN SERVICES                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  AI CONSULTING                                               │"
echo "│  Strategic guidance on AI adoption, from identifying         │"
echo "│  opportunities to implementation planning.                   │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  CUSTOM SOFTWARE                                             │"
echo "│  Bespoke applications built to your exact specifications     │"
echo "│  with modern technologies.                                   │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│  ML INTEGRATION                                              │"
echo "│  Seamlessly integrate machine learning models into your      │"
echo "│  existing systems and workflows.                             │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo "Run 'cat services/<service>.txt' for more details."`,
              },
              "contact.sh": {
                type: "file",
                content: `#!/bin/bash
# Contact Raikhen
# ---------------
# Email: hello@raikhen.com
# Website: https://raikhen.com

echo "Ready to start your project?"
echo "Reach out to us at hello@raikhen.com"`,
              },
            },
          },
        },
      },
    },
  },
};

class FileSystem {
  constructor() {
    this.fs = null;
    this.cwd = "/home/user";
    this.loaded = false;
  }

  load() {
    if (this.loaded) return;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.fs = parsed.fs;
          this.cwd = parsed.cwd || "/home/user";
        } catch (e) {
          this.fs = JSON.parse(JSON.stringify(DEFAULT_FILE_SYSTEM));
        }
      } else {
        this.fs = JSON.parse(JSON.stringify(DEFAULT_FILE_SYSTEM));
      }
    } else {
      this.fs = JSON.parse(JSON.stringify(DEFAULT_FILE_SYSTEM));
    }
    this.loaded = true;
  }

  save() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ fs: this.fs, cwd: this.cwd })
      );
    }
  }

  reset() {
    this.fs = JSON.parse(JSON.stringify(DEFAULT_FILE_SYSTEM));
    this.cwd = "/home/user";
    this.save();
  }

  resolvePath(path) {
    if (!path) return this.cwd;

    let resolvedPath;
    if (path.startsWith("/")) {
      resolvedPath = path;
    } else if (path === "~") {
      resolvedPath = "/home/user";
    } else if (path.startsWith("~/")) {
      resolvedPath = "/home/user" + path.slice(1);
    } else {
      resolvedPath = this.cwd + "/" + path;
    }

    // Normalize path (handle . and ..)
    const parts = resolvedPath.split("/").filter((p) => p && p !== ".");
    const normalized = [];

    for (const part of parts) {
      if (part === "..") {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return "/" + normalized.join("/");
  }

  getNode(path) {
    this.load();
    const resolved = this.resolvePath(path);

    if (resolved === "/") return this.fs["/"];

    const parts = resolved.split("/").filter(Boolean);
    let current = this.fs["/"];

    for (const part of parts) {
      if (!current || current.type !== "dir" || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  getParentNode(path) {
    const resolved = this.resolvePath(path);
    const parts = resolved.split("/").filter(Boolean);
    parts.pop();
    return this.getNode("/" + parts.join("/"));
  }

  exists(path) {
    return this.getNode(path) !== null;
  }

  isDirectory(path) {
    const node = this.getNode(path);
    return node && node.type === "dir";
  }

  isFile(path) {
    const node = this.getNode(path);
    return node && node.type === "file";
  }

  listDir(path = ".") {
    const node = this.getNode(path);
    if (!node || node.type !== "dir") {
      return null;
    }
    return Object.keys(node.children).map((name) => ({
      name,
      type: node.children[name].type,
    }));
  }

  readFile(path) {
    const node = this.getNode(path);
    if (!node || node.type !== "file") {
      return null;
    }
    return node.content;
  }

  writeFile(path, content) {
    this.load();
    const resolved = this.resolvePath(path);
    const parts = resolved.split("/").filter(Boolean);
    const fileName = parts.pop();
    const parentPath = "/" + parts.join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "dir") {
      return { success: false, error: "Parent directory does not exist" };
    }

    parent.children[fileName] = { type: "file", content };
    this.save();
    return { success: true };
  }

  mkdir(path) {
    this.load();
    const resolved = this.resolvePath(path);
    const parts = resolved.split("/").filter(Boolean);
    const dirName = parts.pop();
    const parentPath = "/" + parts.join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "dir") {
      return { success: false, error: "Parent directory does not exist" };
    }

    if (parent.children[dirName]) {
      return { success: false, error: "Already exists" };
    }

    parent.children[dirName] = { type: "dir", children: {} };
    this.save();
    return { success: true };
  }

  rm(path) {
    this.load();
    const resolved = this.resolvePath(path);
    const parts = resolved.split("/").filter(Boolean);
    const name = parts.pop();
    const parentPath = "/" + parts.join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "dir" || !parent.children[name]) {
      return { success: false, error: "No such file or directory" };
    }

    delete parent.children[name];
    this.save();
    return { success: true };
  }

  cd(path) {
    const resolved = this.resolvePath(path);
    const node = this.getNode(resolved);

    if (!node) {
      return { success: false, error: "No such directory" };
    }

    if (node.type !== "dir") {
      return { success: false, error: "Not a directory" };
    }

    this.cwd = resolved;
    this.save();
    return { success: true };
  }

  pwd() {
    this.load();
    return this.cwd;
  }

  getDisplayPath() {
    this.load();
    if (this.cwd.startsWith("/home/user")) {
      return "~" + this.cwd.slice("/home/user".length);
    }
    return this.cwd;
  }
}

// Singleton instance
const fileSystem = new FileSystem();

export default fileSystem;
