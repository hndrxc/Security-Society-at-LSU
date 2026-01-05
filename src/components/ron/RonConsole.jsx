"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { createCommandHandler } from './commands';
import TerminalDisplay from './TerminalDisplay';
import CommandInput from './CommandInput';

const BOOT_SEQUENCE = [
  { text: 'RON_OS v1.0.0 - Security Society at LSU', delay: 100 },
  { text: 'Initializing kernel...', delay: 200 },
  { text: '[OK] Memory check passed', delay: 150 },
  { text: '[OK] Loading modules', delay: 150 },
  { text: '[OK] Network interface: eth0', delay: 100 },
  { text: '[OK] Filesystem mounted', delay: 100 },
  { text: '', delay: 50 },
  { text: 'Welcome to RON Terminal', delay: 100 },
  { text: "Type 'help' for available commands.", delay: 100 },
  { text: '', delay: 50 },
];

export default function RonConsole({ username = 'hacker', onClose }) {
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [isBooting, setIsBooting] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const contentRef = useRef(null);

  const handler = useMemo(() => createCommandHandler(username), [username]);

  // Boot sequence animation
  useEffect(() => {
    let mounted = true;
    let totalDelay = 0;

    BOOT_SEQUENCE.forEach((line) => {
      totalDelay += line.delay;
      setTimeout(() => {
        if (!mounted) return;
        setBootLines((prev) => [...prev, line.text]);
      }, totalDelay);
    });

    setTimeout(() => {
      if (!mounted) return;
      setIsBooting(false);
    }, totalDelay + 300);

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [history, bootLines]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when console is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleCommand = (input) => {
    const prompt = handler.getPrompt();
    const result = handler.execute(input);

    // Add to command history for arrow key navigation
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input]);
    }

    if (result.type === 'clear') {
      setHistory([]);
      return;
    }

    if (result.type === 'exit') {
      onClose();
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        prompt,
        command: input,
        output: result.output,
        type: result.type,
      },
    ]);
  };

  return (
    <div
      className="ron-console-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ron-console-screen">
        <div className="ron-scanlines" />

        <div className="ron-terminal-frame">
          <div className="ron-title-bar">
            <button
              onClick={onClose}
              className="ron-traffic-light ron-close"
              title="Close"
              aria-label="Close terminal"
            />
            <span className="ron-traffic-light ron-minimize" />
            <span className="ron-traffic-light ron-maximize" />
            <span className="ron-title-text">
              RON_TERMINAL v1.0.0 - [Press ESC to close]
            </span>
          </div>

          <div className="ron-terminal-content" ref={contentRef}>
            {/* Boot sequence */}
            {bootLines.map((line, i) => (
              <div key={`boot-${i}`} className="ron-boot-line">
                {line}
              </div>
            ))}

            {/* Command history and input */}
            {!isBooting && (
              <>
                <TerminalDisplay history={history} />
                <CommandInput
                  prompt={handler.getPrompt()}
                  onSubmit={handleCommand}
                  commandHistory={commandHistory}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
