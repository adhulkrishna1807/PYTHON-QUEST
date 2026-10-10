import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WorldBug, Pedestrian, Car, FloatingText, Building } from '../types/game';
import { sound } from '../services/audio';

interface CityMapCanvasProps {
  playerPos: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; isMoving: boolean };
  setPlayerPos: React.Dispatch<React.SetStateAction<{ x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; isMoving: boolean }>>;
  bugs: WorldBug[];
  onEncounterBug: (bug: WorldBug) => void;
  isCombatActive: boolean;
  radarActive: boolean;
  onLaserFire?: () => void;
  projectile?: { x: number; y: number; targetX: number; targetY: number; type: 'laser' | 'grenade' } | null;
}

export const BUILDINGS: Building[] = [
  { id: 'arcade', name: 'GLITCH CITY ARCADE', x: 300, y: 30, w: 180, h: 120, type: 'arcade' },
  { id: 'cafe', name: 'DECO CAFE', x: 680, y: 30, w: 160, h: 110, type: 'cafe' },
  { id: 'farm', name: 'BINARY FARM', x: 920, y: 20, w: 260, h: 160, type: 'farm' },
  { id: 'houses', name: 'SOLAR RESIDENCES', x: 880, y: 440, w: 200, h: 150, type: 'house' },
];

export const CityMapCanvas: React.FC<CityMapCanvasProps> = ({
  playerPos,
  setPlayerPos,
  bugs,
  onEncounterBug,
  isCombatActive,
  radarActive,
  projectile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pedestrians state
  const pedestriansRef = useRef<Pedestrian[]>([
    { id: 'p1', x: 480, y: 230, char: '🚶', dir: 1, axis: 'y', minCoord: 210, maxCoord: 290, speed: 0.7 },
    { id: 'p2', x: 810, y: 235, char: '🚶‍♀️', dir: -1, axis: 'x', minCoord: 760, maxCoord: 850, speed: 0.8 },
    { id: 'p3', x: 690, y: 440, char: '🧍', dir: 1, axis: 'y', minCoord: 410, maxCoord: 490, speed: 0.6 },
    { id: 'p4', x: 180, y: 230, char: '🚶', dir: 1, axis: 'x', minCoord: 120, maxCoord: 280, speed: 0.7 },
  ]);

  // Cars state
  const carsRef = useRef<Car[]>([
    { id: 'c1', x: 575, y: 160, color: '#d90429', axis: 'vertical', dir: 1, speed: 2.2, width: 28, height: 48 }, // Red car going south
    { id: 'c2', x: 720, y: 280, color: '#d90429', axis: 'horizontal', dir: 1, speed: 2.5, width: 52, height: 26 }, // Red car going east
    { id: 'c3', x: 820, y: 325, color: '#00b4d8', axis: 'horizontal', dir: -1, speed: 2.8, width: 52, height: 26 }, // Cyan car going west
    { id: 'c4', x: 420, y: 325, color: '#ff007f', axis: 'horizontal', dir: -1, speed: 2.0, width: 50, height: 26 }, // Pink car
    { id: 'c5', x: 80, y: 275, color: '#ffb703', axis: 'horizontal', dir: 1, speed: 1.8, width: 48, height: 24 }, // Yellow taxi
  ]);

  // Floating text / particles
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const radarWaveRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Check collision with buildings
  const isSolid = useCallback((x: number, y: number): boolean => {
    // Map bounds
    if (x < 30 || x > 1170 || y < 30 || y > 570) return true;

    // Buildings with a 20px padding
    for (const b of BUILDINGS) {
      if (x >= b.x - 16 && x <= b.x + b.w + 16 && y >= b.y - 16 && y <= b.y + b.h + 16) {
        return true;
      }
    }
    return false;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCombatActive) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
        keysPressed.add(e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const moveInterval = setInterval(() => {
      if (isCombatActive || keysPressed.size === 0) return;

      setPlayerPos((prev) => {
        let dx = 0;
        let dy = 0;
        let dir = prev.dir;
        const speed = 4.0;

        if (keysPressed.has('arrowup') || keysPressed.has('w')) {
          dy -= speed;
          dir = 'up';
        }
        if (keysPressed.has('arrowdown') || keysPressed.has('s')) {
          dy += speed;
          dir = 'down';
        }
        if (keysPressed.has('arrowleft') || keysPressed.has('a')) {
          dx -= speed;
          dir = 'left';
        }
        if (keysPressed.has('arrowright') || keysPressed.has('d')) {
          dx += speed;
          dir = 'right';
        }

        const newX = prev.x + dx;
        const newY = prev.y + dy;

        if (!isSolid(newX, newY)) {
          if (Math.random() < 0.25) sound.playStep();
          return { x: newX, y: newY, dir, isMoving: true };
        } else if (!isSolid(newX, prev.y)) {
          return { x: newX, y: prev.y, dir, isMoving: true };
        } else if (!isSolid(prev.x, newY)) {
          return { x: prev.x, y: newY, dir, isMoving: true };
        }
        return { ...prev, dir, isMoving: false };
      });
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [isCombatActive, isSolid, setPlayerPos]);

  // Check collision with bugs on map
  useEffect(() => {
    if (isCombatActive) return;

    for (const bug of bugs) {
      const dist = Math.hypot(playerPos.x - bug.x, playerPos.y - bug.y);
      if (dist < 32) {
        sound.playEncounter();
        onEncounterBug(bug);
        break;
      }
    }
  }, [playerPos, bugs, isCombatActive, onEncounterBug]);

  // Radar trigger animation
  useEffect(() => {
    if (radarActive) {
      radarWaveRef.current = 10;
      sound.playScan();
    }
  }, [radarActive]);

  // Main rendering loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      frameCountRef.current++;
      const frame = frameCountRef.current;

      // Update cars
      carsRef.current.forEach((car) => {
        if (car.axis === 'horizontal') {
          car.x += car.speed * car.dir;
          if (car.dir === 1 && car.x > 1240) car.x = -60;
          if (car.dir === -1 && car.x < -60) car.x = 1240;
        } else {
          car.y += car.speed * car.dir;
          if (car.dir === 1 && car.y > 640) car.y = -60;
          if (car.dir === -1 && car.y < -60) car.y = 640;
        }
      });

      // Update pedestrians
      pedestriansRef.current.forEach((p) => {
        if (p.axis === 'y') {
          p.y += p.speed * p.dir;
          if (p.y > p.maxCoord || p.y < p.minCoord) p.dir = (p.dir * -1) as 1 | -1;
        } else {
          p.x += p.speed * p.dir;
          if (p.x > p.maxCoord || p.x < p.minCoord) p.dir = (p.dir * -1) as 1 | -1;
        }
      });

      // Clear & Background grass / turf
      ctx.fillStyle = '#223d2b';
      ctx.fillRect(0, 0, 1200, 600);

      // Subtle grass texture dots
      ctx.fillStyle = '#1c3424';
      for (let gx = 10; gx < 1200; gx += 40) {
        for (let gy = 10; gy < 600; gy += 40) {
          ctx.fillRect(gx + ((gy % 80 === 0) ? 10 : 0), gy, 4, 4);
        }
      }

      // 1. Street Network: Horizontal Avenue
      const horizStreetY = 250;
      const horizStreetH = 130;
      ctx.fillStyle = '#323640';
      ctx.fillRect(0, horizStreetY, 1200, horizStreetH);
      // Curbs
      ctx.fillStyle = '#1e2128';
      ctx.fillRect(0, horizStreetY - 4, 1200, 4);
      ctx.fillRect(0, horizStreetY + horizStreetH, 1200, 4);

      // 2. Street Network: Vertical Cross Street
      const vertStreetX = 540;
      const vertStreetW = 110;
      ctx.fillStyle = '#323640';
      ctx.fillRect(vertStreetX, 0, vertStreetW, 600);
      // Curbs
      ctx.fillStyle = '#1e2128';
      ctx.fillRect(vertStreetX - 4, 0, 4, 600);
      ctx.fillRect(vertStreetX + vertStreetW, 0, 4, 600);

      // Dashed lane lines (Yellow)
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 14]);

      // Horizontal dashed line
      ctx.beginPath();
      ctx.moveTo(0, horizStreetY + horizStreetH / 2);
      ctx.lineTo(vertStreetX, horizStreetY + horizStreetH / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vertStreetX + vertStreetW, horizStreetY + horizStreetH / 2);
      ctx.lineTo(1200, horizStreetY + horizStreetH / 2);
      ctx.stroke();

      // Vertical dashed line
      ctx.beginPath();
      ctx.moveTo(vertStreetX + vertStreetW / 2, 0);
      ctx.lineTo(vertStreetX + vertStreetW / 2, horizStreetY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vertStreetX + vertStreetW / 2, horizStreetY + horizStreetH);
      ctx.lineTo(vertStreetX + vertStreetW / 2, 600);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash

      // Intersection Crosswalk Zebra Markings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      // West crosswalk
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(vertStreetX - 18, horizStreetY + 8 + i * 16, 12, 8);
      }
      // East crosswalk
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(vertStreetX + vertStreetW + 6, horizStreetY + 8 + i * 16, 12, 8);
      }
      // North crosswalk
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(vertStreetX + 8 + i * 16, horizStreetY - 18, 8, 12);
      }
      // South crosswalk
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(vertStreetX + 8 + i * 16, horizStreetY + horizStreetH + 6, 8, 12);
      }

      // Sidewalks
      ctx.fillStyle = '#484d59';
      ctx.fillRect(0, horizStreetY - 26, 1200, 22);
      ctx.fillRect(0, horizStreetY + horizStreetH + 4, 1200, 22);
      ctx.fillRect(vertStreetX - 26, 0, 22, 600);
      ctx.fillRect(vertStreetX + vertStreetW + 4, 0, 22, 600);

      // Render Buildings
      // 1. Glitch City Arcade
      const arcade = BUILDINGS[0];
      ctx.fillStyle = '#3a1758';
      ctx.fillRect(arcade.x, arcade.y, arcade.w, arcade.h);
      ctx.strokeStyle = '#b5179e';
      ctx.lineWidth = 3;
      ctx.strokeRect(arcade.x, arcade.y, arcade.w, arcade.h);
      // Arcade Marquee
      ctx.fillStyle = '#ff70a6';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GLITCH CITY', arcade.x + arcade.w / 2, arcade.y + 35);
      ctx.fillText('ARCADE', arcade.x + arcade.w / 2, arcade.y + 55);
      // Arcade machines inside
      ctx.fillStyle = '#7209b7';
      ctx.fillRect(arcade.x + 35, arcade.y + 70, 22, 38);
      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(arcade.x + 70, arcade.y + 70, 22, 38);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(arcade.x + 105, arcade.y + 70, 22, 38);
      // Machine screen glows
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(arcade.x + 38, arcade.y + 76, 16, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(arcade.x + 73, arcade.y + 76, 16, 14);
      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(arcade.x + 108, arcade.y + 76, 16, 14);

      // 2. Deco Cafe
      const cafe = BUILDINGS[1];
      ctx.fillStyle = '#0e3447';
      ctx.fillRect(cafe.x, cafe.y, cafe.w, cafe.h);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(cafe.x, cafe.y, cafe.w, cafe.h);
      ctx.fillStyle = '#00f3ff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DECO CAFE', cafe.x + cafe.w / 2, cafe.y + 40);
      ctx.font = '22px monospace';
      ctx.fillText('☕', cafe.x + cafe.w / 2, cafe.y + 80);

      // 3. Binary Farm
      const farm = BUILDINGS[2];
      ctx.fillStyle = '#183d23';
      ctx.fillRect(farm.x, farm.y, farm.w, farm.h);
      ctx.strokeStyle = '#40916c';
      ctx.lineWidth = 3;
      ctx.strokeRect(farm.x, farm.y, farm.w, farm.h);
      // Binary data stream rain
      ctx.fillStyle = 'rgba(82, 183, 136, 0.55)';
      ctx.font = '7px "Fira Code", monospace';
      ctx.textAlign = 'left';
      const binaryRows = [
        '01010000 01111001 01110100 01101000 01101111 01101110',
        '01010001 01110101 01100101 01110011 01110100 00100001',
        '01000111 01101100 01101001 01110100 01100011 01101000',
        '01000011 01101001 01110100 01111001 00110001 00110101',
      ];
      binaryRows.forEach((row, idx) => {
        ctx.fillText(row, farm.x + 10, farm.y + 20 + idx * 14);
      });
      // Farm Animals
      ctx.font = '16px monospace';
      ctx.fillText('🐄', farm.x + 25, farm.y + 115);
      ctx.fillText('🐑', farm.x + 110, farm.y + 90);
      ctx.fillText('🐄', farm.x + 190, farm.y + 130);

      // 4. Solar Houses
      const house = BUILDINGS[3];
      ctx.fillStyle = '#633d22';
      ctx.fillRect(house.x, house.y + 30, house.w, house.h - 30);
      ctx.strokeStyle = '#8f5635';
      ctx.lineWidth = 2;
      ctx.strokeRect(house.x, house.y + 30, house.w, house.h - 30);
      // Blue Solar Roof Panels
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(house.x, house.y, house.w, 30);
      ctx.strokeStyle = '#90e0ef';
      ctx.strokeRect(house.x, house.y, house.w, 30);
      for (let sp = 1; sp < 6; sp++) {
        ctx.beginPath();
        ctx.moveTo(house.x + (house.w / 6) * sp, house.y);
        ctx.lineTo(house.x + (house.w / 6) * sp, house.y + 30);
        ctx.stroke();
      }
      // Wooden Door
      ctx.fillStyle = '#2b1d0c';
      ctx.fillRect(house.x + house.w / 2 - 12, house.y + house.h - 40, 24, 40);

      // Palm Trees
      const palmLocations = [
        { x: 260, y: 190 },
        { x: 500, y: 190 },
        { x: 670, y: 190 },
        { x: 490, y: 410 },
        { x: 740, y: 410 },
        { x: 1100, y: 410 },
      ];
      palmLocations.forEach((palm) => {
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🌴', palm.x, palm.y);
      });

      // Cars
      carsRef.current.forEach((car) => {
        ctx.save();
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.width, car.height);
        ctx.strokeStyle = '#111118';
        ctx.lineWidth = 2;
        ctx.strokeRect(car.x, car.y, car.width, car.height);

        // Windshields
        ctx.fillStyle = '#1e2430';
        if (car.axis === 'horizontal') {
          ctx.fillRect(car.x + (car.dir === 1 ? car.width - 12 : 4), car.y + 3, 8, car.height - 6);
          // Headlights
          ctx.fillStyle = '#ffe600';
          const lightX = car.dir === 1 ? car.x + car.width : car.x - 3;
          ctx.fillRect(lightX, car.y + 2, 3, 5);
          ctx.fillRect(lightX, car.y + car.height - 7, 3, 5);
        } else {
          ctx.fillRect(car.x + 3, car.y + (car.dir === 1 ? car.height - 12 : 4), car.width - 6, 8);
          // Headlights
          ctx.fillStyle = '#ffe600';
          const lightY = car.dir === 1 ? car.y + car.height : car.y - 3;
          ctx.fillRect(car.x + 2, lightY, 5, 3);
          ctx.fillRect(car.x + car.width - 7, lightY, 5, 3);
        }
        ctx.restore();
      });

      // Pedestrians
      pedestriansRef.current.forEach((p) => {
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.char, p.x, p.y);
      });

      // Roaming Bugs
      bugs.forEach((b) => {
        ctx.save();
        ctx.textAlign = 'center';

        if (b.tier === 'boss') {
          // Boss: Production Outage Leviathan
          const pulse = (Math.sin(frame * 0.1) + 1) * 0.5;
          // Warning Ring
          ctx.strokeStyle = `rgba(255, 0, 68, ${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 28 + pulse * 6, 0, Math.PI * 2);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#000000';
          ctx.fillRect(b.x - 70, b.y - 42, 140, 16);
          ctx.strokeStyle = '#ff0044';
          ctx.strokeRect(b.x - 70, b.y - 42, 140, 16);
          ctx.fillStyle = '#ff0044';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('LEVIATHAN [BOSS]', b.x, b.y - 30);

          ctx.font = '28px monospace';
          ctx.fillText('💀', b.x, b.y + 10);
        } else if (b.tier === 'miniboss') {
          // Mini-Boss: Memory Leak Slime
          const bounce = Math.sin(frame * 0.12) * 5;
          // Badge
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(b.x - 45, b.y - 30 + bounce, 90, 14);
          ctx.strokeStyle = '#ff5400';
          ctx.strokeRect(b.x - 45, b.y - 30 + bounce, 90, 14);
          ctx.fillStyle = '#ff5400';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('Memory Leak', b.x, b.y - 20 + bounce);

          // Orange Slime Body
          ctx.fillStyle = '#ff7700';
          ctx.beginPath();
          ctx.arc(b.x, b.y + bounce, 16, Math.PI, 0, false);
          ctx.lineTo(b.x + 16, b.y + 12 + bounce);
          ctx.lineTo(b.x - 16, b.y + 12 + bounce);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffe600';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Eyes
          ctx.font = '10px monospace';
          ctx.fillText('👀', b.x, b.y + 6 + bounce);
        } else {
          // Common Bug: Syntax / Indentation
          const isSyntax = b.errorType.toLowerCase().includes('syntax');
          const bounce = Math.sin(frame * 0.15) * 3;

          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(b.x - 45, b.y - 24 + bounce, 90, 13);
          ctx.strokeStyle = isSyntax ? '#ff0044' : '#00f3ff';
          ctx.strokeRect(b.x - 45, b.y - 24 + bounce, 90, 13);

          ctx.fillStyle = isSyntax ? '#ff0044' : '#00f3ff';
          ctx.font = '6.5px "Press Start 2P", monospace';
          ctx.fillText(isSyntax ? 'Syntax Error' : 'Indentation', b.x, b.y - 15 + bounce);

          ctx.font = '20px monospace';
          ctx.fillText(isSyntax ? '👾' : '🐞', b.x, b.y + 10 + bounce);
        }

        ctx.restore();
      });

      // Radar Scan Wave Animation
      if (radarWaveRef.current > 0) {
        radarWaveRef.current += 16;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(playerPos.x, playerPos.y, radarWaveRef.current, 0, Math.PI * 2);
        ctx.stroke();

        // Highlight bugs caught in wave
        bugs.forEach((b) => {
          const d = Math.hypot(b.x - playerPos.x, b.y - playerPos.y);
          if (Math.abs(d - radarWaveRef.current) < 30) {
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 20, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (radarWaveRef.current > 800) {
          radarWaveRef.current = 0;
        }
        ctx.restore();
      }

      // Projectiles (Refactor Gun laser or Grenade)
      if (projectile) {
        ctx.save();
        if (projectile.type === 'laser') {
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 5;
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(projectile.x, projectile.y);
          ctx.lineTo(projectile.targetX, projectile.targetY);
          ctx.stroke();

          // Laser impact flash
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(projectile.targetX, projectile.targetY, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Grenade explosion shockwave
          ctx.fillStyle = 'rgba(255, 0, 127, 0.6)';
          ctx.beginPath();
          ctx.arc(projectile.targetX, projectile.targetY, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffe600';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Floating reward / damage texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Render Player Character (Coder in Hoodie)
      const px = playerPos.x;
      const py = playerPos.y;

      ctx.save();
      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(px, py + 16, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Purple/Blue Hoodie)
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(px - 9, py - 4, 18, 16);
      ctx.strokeStyle = '#a21caf';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px - 9, py - 4, 18, 16);

      // Head / Face
      ctx.fillStyle = '#ffc3a0';
      ctx.fillRect(px - 6, py - 16, 12, 11);

      // Dark Hair
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(px - 7, py - 19, 14, 5);

      // Eyes based on facing direction
      ctx.fillStyle = '#000000';
      if (playerPos.dir === 'left') {
        ctx.fillRect(px - 6, py - 13, 2, 2);
      } else if (playerPos.dir === 'right') {
        ctx.fillRect(px + 4, py - 13, 2, 2);
      } else if (playerPos.dir === 'down') {
        ctx.fillRect(px - 4, py - 13, 2, 2);
        ctx.fillRect(px + 2, py - 13, 2, 2);
      } else {
        // Back of head
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(px - 6, py - 16, 12, 9);
      }

      // Walking legs animation
      const legOffset = playerPos.isMoving ? Math.sin(frame * 0.3) * 3 : 0;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 7, py + 12, 5, 6 + legOffset);
      ctx.fillRect(px + 2, py + 12, 5, 6 - legOffset);

      // Yellow Pointer Triangle Indicator
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.moveTo(px, py - 23);
      ctx.lineTo(px - 4, py - 28);
      ctx.lineTo(px + 4, py - 28);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playerPos, bugs, projectile, isCombatActive]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded">
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-full h-full object-fill block cursor-crosshair"
      />
    </div>
  );
};
