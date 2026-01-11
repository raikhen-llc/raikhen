import fileSystem from "./fileSystem";

const HELP_TEXT = `Available commands:
  ls [path]           List directory contents
  ls -la [path]       List with details
  cd <path>           Change directory
  pwd                 Print working directory
  cat <file>          Display file contents
  mkdir <dir>         Create directory
  touch <file>        Create empty file
  echo <text> > file  Write text to file
  rm <path>           Remove file or directory
  clear               Clear terminal
  help                Show this help message
  ask                 Enter AI chat mode
  reset               Reset file system to default

Navigation:
  ~                   Home directory (/home/user)
  ..                  Parent directory
  .                   Current directory`;

export function executeCommand(input, options = {}) {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", command: "" };

  // Handle echo with redirection
  const echoMatch = trimmed.match(/^echo\s+(.+?)\s*>\s*(.+)$/);
  if (echoMatch) {
    const [, text, file] = echoMatch;
    const cleanText = text.replace(/^["']|["']$/g, "");
    const result = fileSystem.writeFile(file.trim(), cleanText);
    if (result.success) {
      return { output: "", command: "echo" };
    }
    return { output: `echo: ${result.error}`, command: "echo", isError: true };
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const commandLower = command.toLowerCase();
  const args = parts.slice(1);

  // Handle running shell scripts (./script.sh or script.sh)
  if (command.endsWith(".sh") || command.startsWith("./")) {
    return handleScript(command);
  }

  switch (commandLower) {
    case "ls":
      return handleLs(args);
    case "cd":
      return handleCd(args);
    case "pwd":
      return handlePwd();
    case "cat":
      return handleCat(args);
    case "mkdir":
      return handleMkdir(args);
    case "touch":
      return handleTouch(args);
    case "rm":
      return handleRm(args);
    case "echo":
      return handleEcho(args);
    case "clear":
      return { output: "", command: "clear", shouldClear: true };
    case "help":
      return { output: HELP_TEXT, command: "help" };
    case "ask":
      return { output: "", command: "ask", enterAskMode: true };
    case "reset":
      fileSystem.reset();
      return { output: "File system reset to default.", command: "reset" };
    default:
      return {
        output: `${commandLower}: command not found. Type 'help' for available commands.`,
        command: commandLower,
        isError: true,
      };
  }
}

function handleLs(args) {
  const showDetails =
    args.includes("-la") || args.includes("-l") || args.includes("-a");
  const pathArg = args.find((a) => !a.startsWith("-")) || ".";

  const items = fileSystem.listDir(pathArg);
  if (items === null) {
    return {
      output: `ls: cannot access '${pathArg}': No such file or directory`,
      command: "ls",
      isError: true,
    };
  }

  if (items.length === 0) {
    return { output: "", command: "ls" };
  }

  if (showDetails) {
    const lines = items.map((item) => {
      const typeChar = item.type === "dir" ? "d" : "-";
      const perms = item.type === "dir" ? "rwxr-xr-x" : "rw-r--r--";
      const size = item.type === "dir" ? "4096" : " 512";
      const date = "Jan 11 12:00";
      const name = item.type === "dir" ? `${item.name}/` : item.name;
      return `${typeChar}${perms}  1 user user ${size} ${date} ${name}`;
    });
    return { output: lines.join("\n"), command: "ls" };
  }

  const names = items.map((item) =>
    item.type === "dir" ? `${item.name}/` : item.name
  );
  return { output: names.join("  "), command: "ls" };
}

function handleCd(args) {
  const path = args[0] || "~";
  const result = fileSystem.cd(path);
  if (!result.success) {
    return {
      output: `cd: ${result.error}: ${path}`,
      command: "cd",
      isError: true,
    };
  }
  return { output: "", command: "cd" };
}

function handlePwd() {
  return { output: fileSystem.pwd(), command: "pwd" };
}

function handleCat(args) {
  if (args.length === 0) {
    return {
      output: "cat: missing file operand",
      command: "cat",
      isError: true,
    };
  }

  const content = fileSystem.readFile(args[0]);
  if (content === null) {
    if (fileSystem.isDirectory(args[0])) {
      return {
        output: `cat: ${args[0]}: Is a directory`,
        command: "cat",
        isError: true,
      };
    }
    return {
      output: `cat: ${args[0]}: No such file or directory`,
      command: "cat",
      isError: true,
    };
  }
  return { output: content, command: "cat" };
}

function handleMkdir(args) {
  if (args.length === 0) {
    return {
      output: "mkdir: missing operand",
      command: "mkdir",
      isError: true,
    };
  }

  const result = fileSystem.mkdir(args[0]);
  if (!result.success) {
    return {
      output: `mkdir: cannot create directory '${args[0]}': ${result.error}`,
      command: "mkdir",
      isError: true,
    };
  }
  return { output: "", command: "mkdir" };
}

function handleTouch(args) {
  if (args.length === 0) {
    return {
      output: "touch: missing file operand",
      command: "touch",
      isError: true,
    };
  }

  if (fileSystem.exists(args[0])) {
    return { output: "", command: "touch" };
  }

  const result = fileSystem.writeFile(args[0], "");
  if (!result.success) {
    return {
      output: `touch: cannot touch '${args[0]}': ${result.error}`,
      command: "touch",
      isError: true,
    };
  }
  return { output: "", command: "touch" };
}

function handleRm(args) {
  if (args.length === 0) {
    return { output: "rm: missing operand", command: "rm", isError: true };
  }

  const result = fileSystem.rm(args[0]);
  if (!result.success) {
    return {
      output: `rm: cannot remove '${args[0]}': ${result.error}`,
      command: "rm",
      isError: true,
    };
  }
  return { output: "", command: "rm" };
}

function handleEcho(args) {
  // Simple echo without redirection
  const text = args.join(" ").replace(/^["']|["']$/g, "");
  return { output: text, command: "echo" };
}

function handleScript(scriptPath) {
  // Remove ./ prefix if present
  const cleanPath = scriptPath.startsWith("./")
    ? scriptPath.slice(2)
    : scriptPath;

  const content = fileSystem.readFile(cleanPath);
  if (content === null) {
    if (fileSystem.isDirectory(cleanPath)) {
      return {
        output: `bash: ${scriptPath}: Is a directory`,
        command: scriptPath,
        isError: true,
      };
    }
    return {
      output: `bash: ${scriptPath}: No such file or directory`,
      command: scriptPath,
      isError: true,
    };
  }

  // Parse and "execute" the script by extracting echo statements
  const lines = content.split("\n");
  const outputLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Handle echo statements
    const echoMatch = trimmedLine.match(
      /^echo\s+"(.*)"|^echo\s+'(.*)'|^echo\s+(.*)$/
    );
    if (echoMatch) {
      const text = echoMatch[1] || echoMatch[2] || echoMatch[3] || "";
      outputLines.push(text);
    } else if (trimmedLine === "echo") {
      outputLines.push("");
    }
  }

  return { output: outputLines.join("\n"), command: scriptPath };
}

export function getPrompt() {
  const displayPath = fileSystem.getDisplayPath();
  return `${displayPath} `;
}

export function getCurrentPath() {
  return fileSystem.getDisplayPath();
}
