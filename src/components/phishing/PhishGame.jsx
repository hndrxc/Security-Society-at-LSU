"use client";

import { useRef, useState } from "react";
import { PHISH_SCENARIOS } from "./phishScenarios";
import styles from "./phishing.module.css";

function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export default function PhishGame() {
  const nameInputRef = useRef(null);
  const [phase, setPhase] = useState("gate");
  const [draftName, setDraftName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState("classification");
  const [hadMistake, setHadMistake] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState(null);
  const [selectedClue, setSelectedClue] = useState(null);
  const [feedback, setFeedback] = useState("");

  const scenario = PHISH_SCENARIOS[currentIndex];
  const paddedScore = String(score).padStart(3, "0");
  const progressLabel = phase === "gate" ? "ACCESS GATE" : phase === "complete" ? "SCAN // COMPLETE" : "SCAN // ACTIVE";

  function resetQuestion() {
    setStep("classification");
    setHadMistake(false);
    setSelectedClassification(null);
    setSelectedClue(null);
    setFeedback("");
  }

  function startGame(event) {
    event.preventDefault();
    const cleanName = draftName.trim();

    if (!cleanName) {
      setNameError("Enter a name or handle to begin.");
      nameInputRef.current?.focus();
      return;
    }

    setPlayerName(cleanName);
    setNameError("");
    setCurrentIndex(0);
    setScore(0);
    resetQuestion();
    setPhase("challenge");
  }

  function answerClassification(answer) {
    if (step !== "classification") return;

    const isCorrect = (answer === "real") === scenario.isReal;
    setSelectedClassification(answer);

    if (!isCorrect) {
      setHadMistake(true);
      setFeedback(`NOT QUITE // This message is ${scenario.isReal ? "REAL" : "FAKE"}. Try again.`);
      return;
    }

    if (scenario.isReal) {
      const points = hadMistake ? 50 : 100;
      setScore((currentScore) => currentScore + points);
      setFeedback(`+${points} // Legitimate message.`);
      setStep("ready");
      return;
    }

    setFeedback("Correct! // Now identify the clue.");
    setStep("clue");
  }

  function answerClue(clueIndex) {
    if (step !== "clue" || selectedClue !== null) return;

    setSelectedClue(clueIndex);
    const isCorrect = clueIndex === scenario.correctClue;

    if (isCorrect) {
      const points = hadMistake ? 50 : 100;
      setScore((currentScore) => currentScore + points);
      setFeedback(`+${points} // Correct. Verify the sender before you trust the message.`);
    } else {
      setHadMistake(true);
      setFeedback("TRACE FOUND // The strongest red flag is highlighted in gold.");
    }

    setStep("ready");
  }

  function nextQuestion() {
    if (currentIndex === PHISH_SCENARIOS.length - 1) {
      setPhase("complete");
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetQuestion();
  }

  function playAgain() {
    setPhase("gate");
    setScore(0);
    setCurrentIndex(0);
    resetQuestion();
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }

  return (
    <div className={styles.gameStage}>
      <div className={styles.gameStatus} aria-live="polite">
        <span>{progressLabel}</span>
        <span>SCORE // {paddedScore}</span>
      </div>

      {phase === "gate" ? (
        <form className={styles.nameGate} onSubmit={startGame}>
          <label htmlFor="phish-player-name">Enter your name to begin</label>
          <div className={styles.nameRow}>
            <input
              ref={nameInputRef}
              id="phish-player-name"
              name="player-name"
              maxLength={18}
              autoComplete="nickname"
              placeholder="e.g. packet_wizard"
              value={draftName}
              onChange={(event) => {
                setDraftName(event.target.value);
                if (nameError) setNameError("");
              }}
              aria-describedby="phish-name-error"
              aria-invalid={Boolean(nameError)}
            />
            <button className={styles.gameButton} type="submit">
              Start game <span aria-hidden="true">↗</span>
            </button>
          </div>
          <p className={styles.formNote} id="phish-name-error" aria-live="polite">
            {nameError}
          </p>
        </form>
      ) : null}

      {phase === "challenge" ? (
        <div className={styles.challenge}>
          <div className={styles.challengeMeta}>
            <span>{scenario.type}</span>
            <span>
              {String(currentIndex + 1).padStart(2, "0")} / {PHISH_SCENARIOS.length}
            </span>
          </div>

          <article className={styles.messageCard} aria-label="Message to classify">
            <div className={styles.messageHeader}>
              <span>{scenario.sender}</span>
              <span>{scenario.time}</span>
            </div>
            <h3>{scenario.title}</h3>
            <p>{scenario.body}</p>
            <div className={styles.messageLink}>{scenario.link}</div>
          </article>

          {step === "classification" ? (
            <div className={styles.classification}>
              <p className={styles.challengePrompt}>Is this message real or fake?</p>
              <div className={styles.classificationList}>
                {["real", "fake"].map((answer) => {
                  const selectedWrong = selectedClassification === answer && (answer === "real") !== scenario.isReal;

                  return (
                    <button
                      key={answer}
                      type="button"
                      className={joinClasses(
                        styles.classificationButton,
                        selectedWrong && styles.wrong,
                      )}
                      onClick={() => answerClassification(answer)}
                      aria-describedby="phish-feedback"
                    >
                      {answer.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === "clue" || selectedClue !== null ? (
            <div className={styles.clueStep}>
              <p className={styles.challengePrompt}>What gives it away?</p>
              <div className={styles.clueList}>
                {scenario.clues.map((clue, clueIndex) => {
                  const showCorrect = selectedClue !== null && clueIndex === scenario.correctClue;
                  const showWrong = selectedClue === clueIndex && clueIndex !== scenario.correctClue;

                  return (
                    <button
                      key={clue}
                      type="button"
                      className={joinClasses(
                        styles.clueButton,
                        showCorrect && styles.correct,
                        showWrong && styles.wrong,
                      )}
                      disabled={selectedClue !== null}
                      onClick={() => answerClue(clueIndex)}
                      aria-describedby="phish-feedback"
                    >
                      <span>0{clueIndex + 1}</span>
                      {clue}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <p className={styles.feedback} id="phish-feedback" aria-live="polite">
            {feedback}
          </p>

          {step === "ready" ? (
            <button
              className={`${styles.gameButton} ${styles.nextQuestion}`}
              type="button"
              onClick={nextQuestion}
            >
              {currentIndex === PHISH_SCENARIOS.length - 1 ? "View score" : "Next question"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className={styles.gameComplete}>
          <p className={styles.completeKicker}>SCAN COMPLETE</p>
          <h3>{score} pts</h3>
          <p>
            {score === PHISH_SCENARIOS.length * 100
              ? `${playerName}, perfect read. Nothing slipped past you.`
              : `${playerName}, good instincts. The network is safer with you on it.`}
          </p>
          <button className={styles.gameButton} type="button" onClick={playAgain}>
            Run it again <span aria-hidden="true">↻</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
