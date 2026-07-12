type UploadStepProps = {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function UploadStep({ onFileChange }: UploadStepProps) {
  return (
    <div className="notarize-result">
      <strong>Select Document</strong>
      <p>Choose the document you want to prepare for notarization.</p>
      <input type="file" onChange={onFileChange} />
    </div>
  );
}

export default UploadStep;
