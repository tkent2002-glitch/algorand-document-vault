type UploadStepProps = {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function UploadStep({ onFileChange }: UploadStepProps) {
  return (
    <div className="notarize-result">
      <strong>Select Document</strong>
      <p>Choose the document you want to prepare for notarization.</p>
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
