export function triggerConfetti() {
  const colors = [
    '#4f46e5', // indigo-600
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
  ];

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const confettiCount = 80;

  for (let i = 0; i < confettiCount; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100; // in %
    const size = Math.random() * 8 + 6; // 6px to 14px
    const duration = Math.random() * 2 + 1.5; // 1.5s to 3.5s
    const delay = Math.random() * 0.5; // up to 0.5s delay
    const rotation = Math.random() * 360;

    el.style.setProperty('--confetti-color', color);
    el.style.left = `${left}vw`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.transform = `rotate(${rotation}deg)`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    
    // Add shapes: square or circle
    if (Math.random() > 0.5) {
      el.style.borderRadius = '50%';
    }

    container.appendChild(el);
  }

  // Clean up the container after all confetti have finished falling
  setTimeout(() => {
    container.remove();
  }, 4500);
}
