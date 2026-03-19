import { motion } from 'framer-motion';

export const GeometricAnimation = () => {
  // Create paths for a complex wireframe icosahedron/geometric shape
  const paths = [
    // Outer hexagon
    "M200 50 L350 125 L350 275 L200 350 L50 275 L50 125 Z",
    // Inner triangles
    "M200 50 L200 200 L50 125",
    "M200 50 L200 200 L350 125",
    "M350 125 L200 200 L350 275",
    "M350 275 L200 200 L200 350",
    "M200 350 L200 200 L50 275",
    "M50 275 L200 200 L50 125",
    // Cross connections
    "M50 125 L350 275",
    "M350 125 L50 275",
    "M200 50 L200 350",
    // Additional depth lines
    "M125 87.5 L275 312.5",
    "M275 87.5 L125 312.5",
  ];

  // Smaller floating particles
  const particles = [
    { x: 80, y: 100, size: 4, delay: 0 },
    { x: 320, y: 150, size: 3, delay: 0.5 },
    { x: 150, y: 300, size: 5, delay: 1 },
    { x: 280, y: 280, size: 3, delay: 1.5 },
    { x: 100, y: 220, size: 4, delay: 2 },
    { x: 300, y: 80, size: 3, delay: 0.8 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow orb background */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px] pulse-glow" />
      
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[500px] max-h-[500px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main rotating group */}
        <motion.g
          animate={{
            rotateY: [0, 360],
            rotateX: [0, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "200px 200px" }}
        >
          {paths.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: 2,
                  delay: i * 0.15,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.5,
                  delay: i * 0.15,
                },
              }}
            />
          ))}
        </motion.g>

        {/* Floating particles */}
        {particles.map((particle, i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill="#00F0FF"
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
              y: [particle.y, particle.y - 20, particle.y],
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Central pulsing core */}
        <motion.circle
          cx="200"
          cy="200"
          r="8"
          fill="#00F0FF"
          filter="url(#glow)"
          animate={{
            r: [8, 12, 8],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Orbiting ring */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="120"
          ry="40"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="0.5"
          opacity="0.3"
          animate={{
            rotateX: [60, 60],
            rotateZ: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "200px 200px" }}
        />
      </motion.svg>
    </div>
  );
};

export default GeometricAnimation;
