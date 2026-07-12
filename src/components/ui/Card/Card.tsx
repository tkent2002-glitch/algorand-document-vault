import "./Card.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return <div className={`ui-card ${className}`}>{children}</div>;
}

export default Card;
