import { motion } from 'framer-motion';

/**
 * FloatingShapes — Decorative geometric shapes that float around sections.
 * Hidden on mobile (md:block) to keep the UI clean on small screens.
 */

const shapes = {
  hero: [
    { type: 'circle', color: '#FBBF24', size: 280, top: '10%', left: '-5%', delay: 0, opacity: 0.15 },
    { type: 'circle', color: '#F472B6', size: 60, top: '20%', right: '8%', delay: 1, opacity: 0.5 },
    { type: 'triangle', color: '#8B5CF6', size: 40, top: '65%', right: '12%', delay: 2, opacity: 0.4 },
    { type: 'square', color: '#34D399', size: 30, top: '75%', left: '8%', delay: 0.5, opacity: 0.4 },
    { type: 'circle', color: '#8B5CF6', size: 20, top: '40%', left: '15%', delay: 1.5, opacity: 0.35 },
    { type: 'donut', color: '#FBBF24', size: 50, top: '30%', right: '20%', delay: 3, opacity: 0.3 },
    { type: 'cross', color: '#F472B6', size: 24, top: '80%', right: '25%', delay: 2.5, opacity: 0.4 },
  ],
  features: [
    { type: 'circle', color: '#FBBF24', size: 120, top: '-40px', right: '-30px', delay: 0, opacity: 0.12 },
    { type: 'triangle', color: '#F472B6', size: 35, bottom: '10%', left: '5%', delay: 1, opacity: 0.3 },
    { type: 'square', color: '#34D399', size: 25, top: '20%', right: '5%', delay: 2, opacity: 0.3 },
    { type: 'donut', color: '#8B5CF6', size: 45, bottom: '20%', right: '8%', delay: 1.5, opacity: 0.25 },
  ],
  cta: [
    { type: 'circle', color: '#FFFFFF', size: 200, top: '-60px', right: '-80px', delay: 0, opacity: 0.08 },
    { type: 'triangle', color: '#FBBF24', size: 50, bottom: '15%', left: '10%', delay: 1, opacity: 0.3 },
    { type: 'circle', color: '#F472B6', size: 30, top: '20%', left: '20%', delay: 2, opacity: 0.25 },
    { type: 'square', color: '#FFFFFF', size: 20, bottom: '30%', right: '15%', delay: 0.5, opacity: 0.15 },
    { type: 'cross', color: '#34D399', size: 28, top: '60%', left: '8%', delay: 3, opacity: 0.3 },
  ],
};

function ShapeSVG({ type, color, size }) {
  if (type === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" fill={color} />
      </svg>
    );
  }
  if (type === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <polygon points="50,5 95,95 5,95" fill={color} />
      </svg>
    );
  }
  if (type === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="10" y="10" width="80" height="80" rx="8" fill={color} />
      </svg>
    );
  }
  if (type === 'donut') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="12" fill="none" />
      </svg>
    );
  }
  if (type === 'cross') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="35" y="10" width="30" height="80" rx="6" fill={color} />
        <rect x="10" y="35" width="80" height="30" rx="6" fill={color} />
      </svg>
    );
  }
  return null;
}

export default function FloatingShapes({ variant = 'hero' }) {
  const shapeList = shapes[variant] || shapes.hero;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" aria-hidden="true">
      {shapeList.map((shape, i) => {
        const pos = {};
        if (shape.top) pos.top = shape.top;
        if (shape.bottom) pos.bottom = shape.bottom;
        if (shape.left) pos.left = shape.left;
        if (shape.right) pos.right = shape.right;

        return (
          <motion.div
            key={`${variant}-shape-${i}`}
            className="absolute"
            style={{ ...pos, opacity: shape.opacity }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, shape.type === 'triangle' ? 8 : 5, 0],
            }}
            transition={{
              duration: 4 + shape.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shape.delay,
            }}
          >
            <ShapeSVG type={shape.type} color={shape.color} size={shape.size} />
          </motion.div>
        );
      })}
    </div>
  );
}
