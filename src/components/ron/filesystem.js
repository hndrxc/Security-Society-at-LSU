// Virtual filesystem for RON Terminal
// SSL/LSU themed content with hidden easter eggs

export const filesystem = {
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        hacker: {
          type: 'dir',
          children: {
            '.bashrc': {
              type: 'file',
              content: `# ~/.bashrc
export PS1="\\u@ssl:\\w$ "
alias ll='ls -la'
alias hack='echo "Nice try..."'

# SSL CTF environment
export CTF_MODE=enabled
echo "Welcome to SSL Terminal"
`
            },
            '.ssh': {
              type: 'dir',
              children: {
                'known_hosts': {
                  type: 'file',
                  content: `# Known hosts
ssl-mainframe.local ssh-rsa AAAAB3NzaC1yc2EAAA...
ctf-server.ssl.club ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...
`
                },
                'id_rsa.pub': {
                  type: 'file',
                  content: 'ssh-rsa FAKEPUBLICKEY== hacker@ssl-workstation'
                }
              }
            },
            'notes.txt': {
              type: 'file',
              content: `=== SSL Meeting Notes ===

Tuesday meetings: PFT 1240 @ 6:00 PM
Friday meetings: PFT 1212 @ 6:00 PM

Remember to:
- Practice CTF challenges
- Join the Discord
- Bring snacks

Next CTF: Check /var/ctf/upcoming.txt
`
            },
            'todo.txt': {
              type: 'file',
              content: `TODO:
[x] Join SSL
[x] Find this easter egg
[ ] Win a CTF
[ ] Hack the planet
[ ] Get a job in cybersecurity
`
            },
            'projects': {
              type: 'dir',
              children: {
                'exploit.py': {
                  type: 'file',
                  executable: true,
                  content: `#!/usr/bin/env python3
# Definitely not malware
# This is for educational purposes only

import socket
import sys

def exploit(target):
    """
    Educational buffer overflow demonstration
    DO NOT USE ON SYSTEMS WITHOUT PERMISSION
    """
    print(f"[*] Targeting: {target}")
    print("[*] Just kidding, this is fake!")
    print("[*] Always get permission before testing!")

if __name__ == "__main__":
    print("Nice try! This is just a demo.")
`
                },
                'README.md': {
                  type: 'file',
                  content: `# My CTF Tools

A collection of scripts I use for CTF competitions.

## Tools
- exploit.py - Buffer overflow template
- scanner.sh - Port scanner wrapper

## Resources
- https://ctftime.org
- https://overthewire.org
- SSL Discord for team coordination
`
                }
              }
            }
          }
        }
      }
    },
    etc: {
      type: 'dir',
      children: {
        'passwd': {
          type: 'file',
          content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
hacker:x:1000:1000:SSL Member:/home/hacker:/bin/bash
ctf:x:1001:1001:CTF User:/home/ctf:/bin/bash
`
        },
        'shadow': {
          type: 'file',
          content: `[ACCESS DENIED]
Nice try! The shadow file is protected.
But here's a reward for your curiosity: flag{y0u_f0und_th3_3ast3r_3gg}
`
        },
        'motd': {
          type: 'file',
          content: `
 ██████╗  ██████╗ ███╗   ██╗
 ██╔══██╗██╔═══██╗████╗  ██║
 ██████╔╝██║   ██║██╔██╗ ██║
 ██╔══██╗██║   ██║██║╚██╗██║
 ██║  ██║╚██████╔╝██║ ╚████║
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

 Welcome to RON Terminal
 Security Society at LSU

 Type 'help' for available commands.
`
        },
        'ssl.conf': {
          type: 'file',
          content: `# SSL Configuration
[general]
org_name = "Security Society at LSU"
founded = 2018
location = "Baton Rouge, LA"

[meetings]
tuesday = "PFT 1240 @ 18:00"
friday = "PFT 1212 @ 18:00"

[contact]
discord = "See website for invite"
`
        }
      }
    },
    var: {
      type: 'dir',
      children: {
        log: {
          type: 'dir',
          children: {
            'auth.log': {
              type: 'file',
              content: `Jan  4 12:00:01 ssl-mainframe sshd[1234]: Accepted publickey for hacker
Jan  4 12:05:23 ssl-mainframe sudo[1235]: hacker : TTY=pts/0 ; PWD=/home/hacker ; COMMAND=/bin/cat /etc/shadow
Jan  4 12:05:23 ssl-mainframe sudo[1235]: pam_unix(sudo:auth): authentication failure
Jan  4 12:10:00 ssl-mainframe sshd[1236]: Failed password for root from 192.168.1.100
Jan  4 12:10:01 ssl-mainframe sshd[1236]: Failed password for root from 192.168.1.100
Jan  4 12:10:02 ssl-mainframe sshd[1236]: Connection closed by 192.168.1.100
`
            },
            'system.log': {
              type: 'file',
              content: `[INFO] System startup complete
[INFO] RON Terminal initialized
[WARN] Easter egg mode activated
[INFO] Welcome, curious hacker!
`
            }
          }
        },
        ctf: {
          type: 'dir',
          children: {
            'upcoming.txt': {
              type: 'file',
              content: `=== Upcoming CTF Events ===

Check ctftime.org for the latest competitions!

SSL participates in:
- PicoCTF
- CSAW CTF
- NCL (National Cyber League)
- Various online CTFs

Join our Discord to coordinate teams!
`
            },
            'flags': {
              type: 'dir',
              children: {
                'flag1.txt': {
                  type: 'file',
                  content: 'flag{w3lc0m3_t0_ssl}'
                },
                'flag2.txt': {
                  type: 'file',
                  content: 'flag{r0n_c0ns0l3_m4st3r}'
                },
                'flag3.txt': {
                  type: 'file',
                  content: 'flag{g34ux_t1g3rs}'
                }
              }
            }
          }
        }
      }
    },
    usr: {
      type: 'dir',
      children: {
        bin: {
          type: 'dir',
          children: {
            'ls': { type: 'file', executable: true, content: 'ELF binary - list directory contents' },
            'cat': { type: 'file', executable: true, content: 'ELF binary - concatenate files' },
            'pwd': { type: 'file', executable: true, content: 'ELF binary - print working directory' }
          }
        },
        share: {
          type: 'dir',
          children: {
            'ssl-banner.txt': {
              type: 'file',
              content: `
   _____ _____ _
  / ____/ ____| |
 | (___| (___ | |
  \\___ \\\\___ \\| |
  ____) |___) | |____
 |_____/_____/|______|

 Security Society at LSU
 "Learning security through practice"
`
            }
          }
        }
      }
    },
    tmp: {
      type: 'dir',
      children: {
        'session.txt': {
          type: 'file',
          content: 'RON Terminal Session Active\nUser: hacker\nStarted: ' + new Date().toISOString()
        }
      }
    }
  }
};
