type UploadStepProps = {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  description?: string;
};

function UploadStep({
  onFileChange,
  title = "Select Document",
  description = "Choose the document you want to prepare for notarization.",
}: UploadStepProps) {
  return (
    <div className="notarize-result">
      <strong>{title}</strong>
      <p>{description}</p>
      <label htmlFor="notarization-document">Document to notarize</label>
      <input
        id="notarization-document"
        type="file"
        onChange={onFileChange}
      />
    </div>
  );
}

export default UploadStep;
