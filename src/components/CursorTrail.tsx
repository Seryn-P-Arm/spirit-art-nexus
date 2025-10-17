import { useEffect, useRef } from 'react';

export const CursorTrail = () => {
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const trailCount = 8;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      trailsRef.current.forEach((trail, index) => {
        if (trail) {
          const delay = index * 0.05;
          setTimeout(() => {
            trail.style.left = `${mousePos.current.x}px`;
            trail.style.top = `${mousePos.current.y}px`;
            trail.style.opacity = '1';
          }, delay * 1000);
        }
      });
    };

    const handleMouseEnter = () => {
      trailsRef.current.forEach(trail => {
        if (trail) trail.style.opacity = '1';
      });
    };

    const handleMouseLeave = () => {
      trailsRef.current.forEach(trail => {
        if (trail) trail.style.opacity = '0';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {Array.from({ length: trailCount }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) trailsRef.current[index] = el;
          }}
          className="cursor-trail"
          style={{
            animationDelay: `${index * 0.05}s`,
            opacity: 1 - (index / trailCount) * 0.8,
            transform: `scale(${1 - (index / trailCount) * 0.5})`,
          }}
        />
      ))}
    </>
  );
};
