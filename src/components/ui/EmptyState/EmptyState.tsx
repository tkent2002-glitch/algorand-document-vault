import "./EmptyState.css";

type EmptyStateProps = {
  title: string;
  message: string;
};

function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
