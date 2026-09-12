'use client';
import { LazyMotion, MotionConfig, m, useReducedMotion } from 'motion/react';
const loadFeatures = () => import('./motion-features').then(module => module.default);

export default function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <LazyMotion features={loadFeatures} strict><MotionConfig reducedMotion="user"><m.div className={className} initial={false} whileInView={reduced ? {} : { y: [22, 0], opacity: [0.7, 1] }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</m.div></MotionConfig></LazyMotion>;
}
