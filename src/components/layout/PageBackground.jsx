export default function PageBackground({ children, className = "" }) {
  return <div className={`lab-page ${className}`}>{children}</div>;
}
