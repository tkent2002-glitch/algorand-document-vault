import EvidenceSummaryCard from "../../../components/cards/EvidenceSummaryCard";

type EvidenceReviewStepProps = {
  prettyPayload: string;
};

function EvidenceReviewStep({ prettyPayload }: EvidenceReviewStepProps) {
  if (!prettyPayload) {
    return null;
  }

  return (
    <div className="notarize-result">
      <EvidenceSummaryCard payloadJson={prettyPayload} />
    </div>
  );
}

export default EvidenceReviewStep;
