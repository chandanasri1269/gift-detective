import React, { useEffect, useState } from "react";

interface AnalyzingOverlayProps {
  recipientName: string;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ recipientName }) => {
  const steps = [
    "Analyzing recipient profile and behavioral quirks...",
    "Scanning 45+ gift catalog clues and tags...",
    "Cross-referencing budget constraints and INR pricing...",
    "Evaluating color and aesthetic personality affinities...",
    "Applying safeguard filters to eliminate generic clutter...",
    "Synthesizing customized detective deductions...",
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="analyzing-overlay glass-panel">
      <div className="radar-container">
        <div className="radar-circle circle-1"></div>
        <div className="radar-circle circle-2"></div>
        <div className="radar-circle circle-3"></div>
        <div className="radar-beam"></div>
        <span className="radar-icon">🕵️‍♂️</span>
      </div>

      <h2 className="analyzing-title">Gift Investigation in Progress</h2>
      <p className="analyzing-subtitle">
        Investigating prime gift candidates for <strong>{recipientName || "the recipient"}</strong>...
      </p>

      <div className="analyzing-status-pill">
        <span className="status-spinner"></span>
        <span>{steps[currentStepIdx]}</span>
      </div>
    </div>
  );
};
