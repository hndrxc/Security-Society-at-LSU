"use client";

export default function TerminalDisplay({ history }) {
  return (
    <div className="ron-history">
      {history.map((entry, i) => (
        <div key={i} className="ron-history-entry">
          {entry.prompt && (
            <div className="ron-input-line">
              <span className="ron-prompt">{entry.prompt}</span>
              <span className="ron-command-text">{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <pre className={`ron-output ron-output-${entry.type}`}>
              {entry.output}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
