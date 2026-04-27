import { CheckCircle2, Shuffle, XCircle } from "lucide-react";
import type { ValidationResult } from "../types/puzzle";

type ProgressPanelProps = {
  result: ValidationResult;
  totalPieces: number;
  hasSubmitted: boolean;
};

export function ProgressPanel({ result, totalPieces, hasSubmitted }: ProgressPanelProps) {
  const percentage = Math.round((result.correctPositions / totalPieces) * 100);

  return (
    <section className="progress-panel">
      <div className="progress-header">
        <span>Progression</span>
        <strong>{percentage}%</strong>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="progress-stats">
        <div>
          <CheckCircle2 size={18} />
          <span>{result.correctPositions}/{totalPieces} positions correctes</span>
        </div>
        <div>
          <XCircle size={18} />
          <span>{result.invalidConnections.length} connexions invalides</span>
        </div>
        <div>
          <Shuffle size={18} />
          <span>{hasSubmitted ? "Validation effectuée" : "Réarrangez les pièces"}</span>
        </div>
      </div>
    </section>
  );
}
