import Link from 'next/link';

export function Panel({ as: Tag = 'section', className = '', children, ...props }) {
  return <Tag className={`lab-panel ${className}`} {...props}>{children}</Tag>;
}
export function PageHeading({ eyebrow, title, description, children }) {
  return <div className="lab-heading"><div><p className="lab-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="lab-description">{description}</p>}</div>{children}</div>;
}
export function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`lab-button lab-button--${variant} ${className}`} {...props} />;
}
export function ActionLink({ variant = 'primary', className = '', href, ...props }) {
  const Tag = href.startsWith('/') ? Link : 'a';
  return <Tag href={href} className={`lab-button lab-button--${variant} ${className}`} {...props} />;
}
export function Field({ label, id, className = '', ...props }) {
  return <div className={`lab-field ${className}`}><label htmlFor={id}>{label}</label><input id={id} className="lab-input" {...props} /></div>;
}
export function Badge({ tone = 'neutral', children }) {
  return <span className={`lab-badge lab-badge--${tone}`}>{children}</span>;
}
export function Feedback({ tone = 'info', children, className = '', ...props }) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`lab-feedback lab-feedback--${tone} ${className}`} {...props}>{children}</div>;
}
export function Breadcrumbs({ items }) {
  return <nav aria-label="Breadcrumb" className="lab-breadcrumbs"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
