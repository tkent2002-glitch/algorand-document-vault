import "./PageHeader.css";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="ui-page-header">
      {eyebrow && <p className="ui-page-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default PageHeader;
