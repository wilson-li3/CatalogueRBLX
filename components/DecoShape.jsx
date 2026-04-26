"use client";

export default function DecoShape({ type, color, style }) {
  const shapes = {
    blob1: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path fill={color} d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,73.1,41.7C64.8,54.3,53.8,65.1,40.7,72.4C27.6,79.7,12.4,83.5,-2.2,87.1C-16.8,90.7,-30.8,94,-44.1,88.6C-57.3,83.2,-69.7,69.1,-77.3,53.3C-84.9,37.5,-87.7,20,-85.5,3.6C-83.3,-12.8,-76.1,-28.1,-66.5,-40.7C-56.9,-53.3,-44.9,-63.2,-31.8,-71C-18.7,-78.8,-4.7,-84.5,6,-84.1C16.6,-83.7,30.6,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>
    ),
    blob2: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path fill={color} d="M39.5,-65.3C52.9,-60.2,66.8,-53.3,74.4,-41.8C82,-30.3,83.3,-14.2,80.2,-0.2C77.2,13.8,69.8,25.8,62.1,38.1C54.4,50.4,46.4,63,35.1,70.3C23.8,77.6,9.2,79.6,-4.7,78.1C-18.6,76.6,-31.8,71.6,-43.7,64.1C-55.6,56.6,-66.2,46.6,-72.8,34C-79.4,21.4,-82,6.2,-79.6,-7.7C-77.2,-21.6,-69.8,-34.2,-59.7,-42.8C-49.6,-51.4,-36.8,-56,-24.6,-61.7C-12.4,-67.4,-0.8,-74.2,8.4,-73.5C17.6,-72.8,26.1,-70.4,39.5,-65.3Z" transform="translate(100 100)" />
      </svg>
    ),
    ring: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={style}>
        <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="8" opacity="0.6" />
      </svg>
    ),
    scribble: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 C20,30 70,25 75,45 C80,65 30,75 25,55" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    dots: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={style}>
        {Array.from({ length: 25 }, (_, i) => (
          <circle key={i} cx={10 + (i % 5) * 15} cy={10 + Math.floor(i / 5) * 15} r="2" fill={color} opacity={0.2} />
        ))}
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path d="M30,5 C50,25 55,60 30,95 C5,60 10,25 30,5Z" fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
        <line x1="30" y1="15" x2="30" y2="85" stroke={color} strokeWidth="1.5" opacity="0.3" />
      </svg>
    ),
  };
  return shapes[type] || null;
}
