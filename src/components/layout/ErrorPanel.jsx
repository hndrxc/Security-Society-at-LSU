import PageBackground from './PageBackground';
import { Panel } from '@/components/ui/primitives';
export default function ErrorPanel({ eyebrow, title, description, children }) {
  return <PageBackground><main id="main-content" className="py-1"><Panel className="lab-error"><p className="lab-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lab-muted">{description}</p><div className="lab-actions">{children}</div></Panel></main></PageBackground>;
}
