/**
 * FocusFlow — Ambient Sunbeam & Dust Particles
 * Simulates gentle dust motes floating through warm sunlight in a cozy room.
 */

class AmbientParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Populate particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticle(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25 + 0.1, // gentle drift
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? 'rgba(255, 235, 195,' : 'rgba(216, 180, 254,' // Warm gold / soft violet
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.y += p.speedY;
      p.x += p.speedX;
      p.pulse += p.pulseSpeed;

      const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color} ${Math.max(0, currentOpacity)})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = 'rgba(255, 240, 200, 0.4)';
      this.ctx.fill();

      // Wrap around bounds
      if (p.y < -10) {
        this.particles[i] = this.createParticle(false);
      }
      if (p.x > this.width + 10) p.x = -5;
      if (p.x < -10) p.x = this.width + 5;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particles on page load
document.addEventListener('DOMContentLoaded', () => {
  new AmbientParticles('ambient-canvas');
});
