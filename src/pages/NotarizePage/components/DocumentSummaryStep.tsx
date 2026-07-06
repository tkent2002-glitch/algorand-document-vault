type DocumentSummaryStepProps = {
  fileName: string;
  fileHash: string;
  errors: string[];
};

function DocumentSummaryStep({
  fileName,
  fileHash,
  errors,
}: DocumentSummaryStepProps) {
  return (
    <>
      {errors.length > 0 && (
        <div className="notarize-errors">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {fileName && (
        <div className="notarize-result">
          <strong>Selected File:</strong>
          <p>{fileName}</p>
        </div>
      )}

      {fileHash && (
        <div className="notarize-result">
          <strong>SHA-256 Hash:</strong>
          <code>{fileHash}</code>
        </div>
      )}
    </>
  );
}

export default DocumentSummaryStep;
