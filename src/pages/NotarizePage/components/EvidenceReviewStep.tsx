type EvidenceReviewStepProps = {
  prettyPayload: string;
};

function EvidenceReviewStep({ prettyPayload }: EvidenceReviewStepProps) {
  if (!prettyPayload) {
    return null;
  }

  return (
    <div className="notarize-result">
      <strong>Blockchain Proof Payload Preview</strong>
      <p>This is the only document proof data prepared for Algorand.</p>
      <pre>
        <code>{prettyPayload}</code>
      </pre>
    </div>
  );
}

export default EvidenceReviewStep;
