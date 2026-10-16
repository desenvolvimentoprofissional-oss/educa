import { useRef, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface Props {
  children: ReactNode;
  height?: string;
  id?: string;
}

export function LazyLoadSection({ children, height = '600px', id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '200px' });

  return (
    <div 
      ref={ref} 
      id={id}
      className="w-full"
      style={{ 
        minHeight: height,
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${height}`
      }}
    >
      {isInView ? children : null}
    </div>
  );
}
