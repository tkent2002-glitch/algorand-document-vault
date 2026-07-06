import type { AlgorandSignedProofTransaction } from "../../../types";

type SignSubmitStepProps = {
  readyForSignature: boolean;
  signingMessage: string;
  signedTransaction: AlgorandSignedProofTransaction | null;
  onSignTransaction: () => void;
};

function SignSubmitStep({
  readyForSignature,
  signingMessage,
  signedTransaction,
  onSignTransaction,
}: SignSubmitStepProps) {
  return (
    <>
      <div className="notarize-result">
        <strong>Signature Readiness</strong>
        <p>
          {readyForSignature
            ? "Ready for Pera Wallet signature."
            : "Not ready for signature."}
        </p>

        {signingMessage && <p>{signingMessage}</p>}

        <button onClick={onSignTransaction} disabled={!readyForSignature}>
          Sign with Pera Wallet
        </button>
      </div>

      {signedTransaction && (
        <div className="notarize-result">
          <strong>Submission Confirmation</strong>
          <p>Transaction signed successfully.</p>
          <p>Transaction ID: {signedTransaction.txId}</p>
          <p>Signed Bytes: {signedTransaction.signedTransactionByteLength}</p>
          <p>Signed At: {signedTransaction.signedAt}</p>
          <p>Status: Signed but not submitted to Algorand.</p>
          <p>Next step: submit this signed transaction to Algorand TestNet.</p>

          <button disabled>Submit to Algorand Coming Next</button>
        </div>
      )}
    </>
  );
}

export default SignSubmitStep;
