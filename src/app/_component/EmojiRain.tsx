import { useState, useEffect, useRef, useCallback } from 'react';

const EmojiRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const rainIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextIdRef = useRef<number>(0);

  const [ballCount, setBallCount] = useState<number>(0);
  const [gravityEnabled] = useState<boolean>(true);
  const [rainEnabled, setRainEnabled] = useState<boolean>(false);
  const [speed] = useState<number>(0.1);

  const colors: string[] = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3',
    '#54A0FF',
  ];

  const emojis: string[] = [
    '😀',
    '😎',
    '🥳',
    '😍',
    '🤪',
    '😋',
    '🙃',
    '🤩',
    '😊',
    '🥰',
    '🤖',
    '👾',
    '🦄',
    '🐱',
    '🐶',
    '🐻',
    '🐯',
    '🦊',
    '🐸',
    '🐵',
    '⚽',
    '🏀',
    '🏈',
    '🎾',
    '🥎',
    '🏐',
    '🎱',
    '🍎',
    '🍊',
    '🍋',
    '🍌',
    '🍇',
    '🍓',
    '🎯',
    '🌟',
    '⭐',
    '✨',
    '🔥',
    '💎',
    '🎈',
    '🎃',
    '🎄',
    '❄️',
    '☀️',
    '🌙',
    '🌈',
    '⚡',
    '💫',
    '🌸',
    '🌺',
  ];

  class Ball {
    public id: number;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public emoji: string;
    public isRain: boolean;
    public element: HTMLDivElement | null;
    public vx: number;
    public vy: number;
    public mass: number;

    constructor(
      x: number,
      y: number,
      radius: number,
      color: string,
      emoji: string,
      isRain: boolean = false
    ) {
      this.id = nextIdRef.current++;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.emoji = emoji;
      this.isRain = isRain;
      this.element = null;

      if (isRain) {
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = Math.random() * 1.5 + 1;
      } else {
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
      }

      this.mass = radius;
      this.createElement();
    }

    createElement(): void {
      this.element = document.createElement('div');
      this.element.style.position = 'absolute';
      this.element.style.display = 'flex';
      this.element.style.alignItems = 'center';
      this.element.style.justifyContent = 'center';
      this.element.style.userSelect = 'none';
      this.element.style.transition = 'transform 0.1s ease, filter 0.1s ease';
      this.element.style.width = this.radius * 2 + 'px';
      this.element.style.height = this.radius * 2 + 'px';
      this.element.style.fontSize = this.radius * 1.8 + 'px';
      this.element.textContent = this.emoji;

      if (containerRef.current) {
        containerRef.current.appendChild(this.element);
      }
    }

    update(
      containerWidth: number,
      containerHeight: number,
      gravityEnabled: boolean,
      speedMultiplier: number
    ): void {
      if (gravityEnabled) {
        this.vy += 0.15;
      }

      this.x += this.vx * speedMultiplier;
      this.y += this.vy * speedMultiplier;

      // 벽 충돌 검사
      if (this.x - this.radius <= 0) {
        this.x = this.radius;
        this.vx = -this.vx * 0.8;
        this.showCollisionEffect();
      }
      if (this.x + this.radius >= containerWidth) {
        this.x = containerWidth - this.radius;
        this.vx = -this.vx * 0.8;
        this.showCollisionEffect();
      }
      if (this.y - this.radius <= 0) {
        this.y = this.radius;
        this.vy = -this.vy * 0.8;
        this.showCollisionEffect();
      }
      if (this.y + this.radius >= containerHeight) {
        this.y = containerHeight - this.radius;

        this.vy = -this.vy * 0.3;
        this.vx *= 0.7;
        this.showCollisionEffect();

        if (Math.abs(this.vy) < 1 && Math.abs(this.vx) < 1) {
          this.vy = 0;
          this.vx *= 0.9;
        }
      }

      // 바닥 근처에서는 마찰력 증가
      if (this.y > containerHeight - this.radius * 3) {
        this.vx *= 0.95;
        this.vy *= 0.98;
      } else {
        this.vx *= 0.999;
        this.vy *= 0.999;
      }

      // DOM 직접 업데이트 (React 리렌더링 없이)
      if (this.element) {
        this.element.style.left = this.x - this.radius + 'px';
        this.element.style.top = this.y - this.radius + 'px';
      }
    }

    showCollisionEffect(): void {
      if (this.element) {
        this.element.style.transform = 'scale(1.1)';
        this.element.style.filter =
          'brightness(1.3) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))';

        setTimeout(() => {
          if (this.element) {
            this.element.style.transform = 'scale(1)';
            this.element.style.filter = 'none';
          }
        }, 200);
      }
    }

    checkCollision(other: Ball): boolean {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.radius + other.radius;
    }

    resolveCollision(other: Ball): void {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return;

      const nx = dx / distance;
      const ny = dy / distance;

      const dvx = this.vx - other.vx;
      const dvy = this.vy - other.vy;

      const dvn = dvx * nx + dvy * ny;

      if (dvn > 0) return;

      const totalMass = this.mass + other.mass;
      const impulse = (2 * dvn) / totalMass;

      this.vx -= impulse * other.mass * nx;
      this.vy -= impulse * other.mass * ny;
      other.vx += impulse * this.mass * nx;
      other.vy += impulse * this.mass * ny;

      const overlap = this.radius + other.radius - distance;
      const separationX = nx * overlap * 0.5;
      const separationY = ny * overlap * 0.5;

      this.x += separationX;
      this.y += separationY;
      other.x -= separationX;
      other.y -= separationY;

      this.showCollisionEffect();
      other.showCollisionEffect();
    }

    destroy(): void {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }

  const createBall = useCallback(
    (x?: number, y?: number, isRain: boolean = false): void => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const radius = Math.random() * (isRain ? 25 : 30) + (isRain ? 15 : 20);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      let ballX = x ?? 0;
      let ballY = y ?? 0;

      if (isRain) {
        ballX = Math.random() * (containerWidth - radius * 2) + radius;
        ballY = -radius;
      } else if (x === undefined || y === undefined) {
        ballX = Math.random() * (containerWidth - radius * 2) + radius;
        ballY = Math.random() * (containerHeight - radius * 2) + radius;
      }

      const ball = new Ball(ballX, ballY, radius, color, emoji, isRain);
      ballsRef.current.push(ball);
      setBallCount(ballsRef.current.length);
    },
    [colors, emojis]
  );

  // const addBall = useCallback((): void => {
  //   createBall();
  // }, [createBall]);

  const addRainBall = useCallback((): void => {
    createBall(0, 0, true);
  }, [createBall]);

  const startRain = useCallback((): void => {
    if (rainEnabled) return;

    setRainEnabled(true);
    rainIntervalRef.current = setInterval(() => {
      addRainBall();
    }, 300);
  }, [rainEnabled, addRainBall]);

  const stopRain = useCallback((): void => {
    setRainEnabled(false);

    if (rainIntervalRef.current) {
      clearInterval(rainIntervalRef.current);
      rainIntervalRef.current = null;
    }
  }, []);

  // const clearBalls = useCallback((): void => {
  //   ballsRef.current.forEach((ball) => ball.destroy());
  //   ballsRef.current = [];
  //   setBallCount(0);
  //   stopRain();
  // }, [stopRain]);

  // const toggleGravity = useCallback((): void => {
  //   setGravityEnabled((prev) => !prev);
  // }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createBall(x, y);
    },
    [createBall]
  );

  const animate = useCallback((): void => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // 공 업데이트 (DOM 직접 조작)
    ballsRef.current.forEach((ball) => {
      ball.update(containerWidth, containerHeight, gravityEnabled, speed);
    });

    // 충돌 검사
    for (let i = 0; i < ballsRef.current.length; i++) {
      for (let j = i + 1; j < ballsRef.current.length; j++) {
        if (ballsRef.current[i].checkCollision(ballsRef.current[j])) {
          ballsRef.current[i].resolveCollision(ballsRef.current[j]);
        }
      }
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }, [gravityEnabled, speed]);

  useEffect(() => {
    // 초기 공 몇 개 추가
    createBall();

    // 애니메이션 시작
    const startAnimation = (): void => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      animate();
    };

    startAnimation();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rainIntervalRef.current) {
        clearInterval(rainIntervalRef.current);
      }
      // 모든 공 정리
      ballsRef.current.forEach((ball) => ball.destroy());
      ballsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    animate();
  }, [animate]);

  useEffect(() => {
    if (ballCount > 45) {
      stopRain();
    }
  }, [ballCount, stopRain]);

  useEffect(() => {
    startRain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  //   setSpeed(parseFloat(e.target.value));
  // };

  return (
    <div className="w-full h-full">
      {/* Container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative w-full h-full overflow-hidden cursor-pointer">
        {/* 이모지들은 직접 DOM 조작으로 여기에 추가됩니다 */}
      </div>
    </div>
  );
};

export default EmojiRain;
