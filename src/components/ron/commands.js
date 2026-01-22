// Command handler for RON Terminal
import { filesystem } from './filesystem';

export const createCommandHandler = (username = 'hacker') => {
  let cwd = '/home/hacker';

  const resolvePath = (path) => {
    if (!path) return cwd;
    if (path.startsWith('/')) return path;
    if (path === '~') return '/home/hacker';
    if (path.startsWith('~/')) return '/home/hacker' + path.slice(1);

    const parts = cwd.split('/').filter(Boolean);
    const targetParts = path.split('/');

    for (const part of targetParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.' && part !== '') {
        parts.push(part);
      }
    }

    return '/' + parts.join('/');
  };

  const getNode = (path) => {
    const resolved = resolvePath(path);
    if (resolved === '/') return filesystem;

    const parts = resolved.split('/').filter(Boolean);
    let node = filesystem;

    for (const part of parts) {
      if (!node || node.type !== 'dir' || !node.children || !node.children[part]) {
        return null;
      }
      node = node.children[part];
    }

    return node;
  };

  const commands = {
    help: () => ({
      output: `
RON TERMINAL v1.0.0
===================
Available commands:

  ls [path]     - List directory contents
  cd <path>     - Change directory
  pwd           - Print working directory
  cat <file>    - Display file contents
  clear         - Clear terminal screen
  whoami        - Display current user
  uname [-a]    - Display system information
  date          - Display current date/time
  echo <text>   - Print text to terminal
  exit          - Close terminal

Easter eggs hidden... try to find them!

Press ESC to close the terminal.
`,
      type: 'info'
    }),

    ls: (args) => {
      const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const pathArg = args.find(a => !a.startsWith('-')) || cwd;
      const node = getNode(pathArg);

      if (!node) {
        return { output: `ls: cannot access '${pathArg}': No such file or directory`, type: 'error' };
      }

      if (node.type === 'file') {
        return { output: pathArg.split('/').pop(), type: 'success' };
      }

      const entries = Object.entries(node.children)
        .filter(([name]) => showHidden || !name.startsWith('.'))
        .map(([name, item]) => {
          if (item.type === 'dir') {
            return `${name}/`;
          }
          if (item.executable) {
            return `${name}*`;
          }
          return name;
        });

      return { output: entries.join('  ') || '(empty directory)', type: 'success' };
    },

    cd: (args) => {
      if (!args[0] || args[0] === '~') {
        cwd = '/home/hacker';
        return { output: '', type: 'success' };
      }

      const newPath = resolvePath(args[0]);
      const node = getNode(args[0]);

      if (!node) {
        return { output: `cd: ${args[0]}: No such file or directory`, type: 'error' };
      }

      if (node.type !== 'dir') {
        return { output: `cd: ${args[0]}: Not a directory`, type: 'error' };
      }

      cwd = newPath;
      return { output: '', type: 'success' };
    },

    pwd: () => ({ output: cwd, type: 'success' }),

    cat: (args) => {
      if (!args[0]) {
        return { output: 'cat: missing operand', type: 'error' };
      }

      const node = getNode(args[0]);

      if (!node) {
        return { output: `cat: ${args[0]}: No such file or directory`, type: 'error' };
      }

      if (node.type === 'dir') {
        return { output: `cat: ${args[0]}: Is a directory`, type: 'error' };
      }

      return { output: node.content, type: 'success' };
    },

    clear: () => ({ output: '__CLEAR__', type: 'clear' }),

    exit: () => ({ output: '__EXIT__', type: 'exit' }),

    whoami: () => ({ output: username, type: 'success' }),

    uname: (args) => {
      if (args[0] === '-a') {
        return {
          output: 'RON_OS 1.0.0 SSL-MAINFRAME x86_64 GNU/Linux',
          type: 'success'
        };
      }
      return { output: 'RON_OS', type: 'success' };
    },

    date: () => ({ output: new Date().toString(), type: 'success' }),

    echo: (args) => ({ output: args.join(' '), type: 'success' }),

    // Easter egg commands
    sudo: (args) => ({
      output: `[sudo] password for ${username}:
${username} is not in the sudoers file. This incident will be reported.`,
      type: 'error'
    }),

    rm: (args) => {
      if (args.includes('-rf') && args.includes('/')) {
        return {
          output: `Nice try! This is a read-only filesystem... and also not real.
But I appreciate the enthusiasm!`,
          type: 'error'
        };
      }
      return { output: 'rm: operation not permitted (read-only filesystem)', type: 'error' };
    },

    matrix: () => ({
      output: `Wake up, ${username}...
The Matrix has you...
Follow the white rabbit.

01001000 01000001 01000011 01001011
01010100 01001000 01000101
01010000 01001100 01000001 01001110 01000101 01010100`,
      type: 'success'
    }),

    hack: () => ({
      output: `[*] Initializing hack sequence...
[*] Bypassing firewall............... DONE
[*] Accessing mainframe.............. DONE
[*] Downloading secrets.............. DONE
[*] Covering tracks.................. DONE

[!] Just kidding. This is a fake terminal.
[!] But you found the easter egg! Nice work, ${username}.
[!] Real hacking requires permission. Stay ethical!`,
      type: 'info'
    }),

    geaux: () => ({
      output: `
   ████████╗██╗ ██████╗ ███████╗██████╗ ███████╗
   ╚══██╔══╝██║██╔════╝ ██╔════╝██╔══██╗██╔════╝
      ██║   ██║██║  ███╗█████╗  ██████╔╝███████╗
      ██║   ██║██║   ██║██╔══╝  ██╔══██╗╚════██║
      ██║   ██║╚██████╔╝███████╗██║  ██║███████║
      ╚═╝   ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝
                   GEAUX TIGERS!`,
      type: 'success'
    }),

    ssl: () => ({
      output: `
  ███████╗███████╗██╗
  ██╔════╝██╔════╝██║
  ███████╗███████╗██║
  ╚════██║╚════██║██║
  ███████║███████║███████╗
  ╚══════╝╚══════╝╚══════╝

  Security Society at LSU
  "Hack the planet!" (with permission)`,
      type: 'success'
    }),

    cowsay: (args) => {
      const message = args.join(' ') || 'Moo!';
      const border = '-'.repeat(message.length + 2);
      return {
        output: `
 ${border}
< ${message} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`,
        type: 'success'
      };
    },

    neofetch: () => ({
      output: `
       .--.          ${username}@ssl-mainframe
      |o_o |         ----------------------
      |:_/ |         OS: RON_OS 1.0.0
     //   \\ \\        Host: SSL Mainframe
    (|     | )       Kernel: 5.15.0-ron
   /'\\_   _/\`\\       Shell: ronsh
   \\___)=(___/       Terminal: RON Terminal

                     Security Society at LSU`,
      type: 'success'
    }),

    flag: () => ({
      output: `Flags are hidden throughout the filesystem.
Try exploring with 'ls', 'cd', and 'cat'.
Hint: Check /var/ctf/flags/ and /etc/shadow`,
      type: 'info'
    }),
  };

  return {
    execute: (input) => {
      const trimmed = input.trim();
      if (!trimmed) return { output: '', type: 'success' };

      const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const cmd = parts[0]?.toLowerCase();
      const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

      const handler = commands[cmd];

      if (!handler) {
        return { output: `${cmd}: command not found. Type 'help' for available commands.`, type: 'error' };
      }

      return handler(args);
    },
    getCwd: () => cwd,
    getPrompt: () => `${username}@ssl:${cwd === '/home/hacker' ? '~' : cwd}$ `
  };
};
