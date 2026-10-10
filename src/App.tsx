/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorldBug, BugEncounter, BugOption, PlayerStats } from './types/game';
import { sound } from './services/audio';
import { fetchBugEncounter, checkServerStatus, getGenerationStatus } from './services/geminiService';
import { CityMapCanvas } from './components/CityMapCanvas';
import { CombatModal } from './components/CombatModal';
import { MinimapWidget } from './components/MinimapWidget';
import { SettingsModal } from './components/SettingsModal';
import { LevelUpBanner } from './components/LevelUpBanner';

export default function App() {
  // Player state
  const [playerPos, setPlayerPos] = useState<{
    x: number;
    y: number;
    dir: 'up' | 'down' | 'left' | 'right';
    isMoving: boolean;
  }>({
    x: 580,
    y: 310,
    dir: 'down',
    isMoving: false,
  });

  // Player stats
  const [stats, setStats] = useState<PlayerStats>({
    level: 12,
    title: 'Junior Dev',
    xp: 1450,
    maxXp: 2000,
    hp: 95,
    maxHp: 100,
    gold: 3450,
    linterGems: 3,
    bugsSlain: 14,
    bossesDefeated: 1,
  });

  // Active perks & inventory
  const [activePerks, setActivePerks] = useState<{
    shield: boolean;
    autoFormatUnlocked: boolean;
  }>({
    shield: true,
    autoFormatUnlocked: true,
  });

  // World bugs
  const [bugs, setBugs] = useState<WorldBug[]>([
    {
      id: 'bug-world-01',
      x: 760,
      y: 420,
      name: 'Memory Leak Slime',
      tier: 'miniboss',
      level: 16,
      errorType: 'MemoryLeak',
      sprite: 'slime',
    },
    {
      id: 'bug-world-02',
      x: 940,
      y: 280,
      name: 'Syntax Error Viper',
      tier: 'common',
      level: 12,
      errorType: 'SyntaxError',
      sprite: 'syntax',
    },
    {
      id: 'bug-world-03',
      x: 380,
      y: 330,
      name: 'Indentation Error',
      tier: 'common',
      level: 11,
      errorType: 'IndentationError',
      sprite: 'indentation',
    },
    {
      id: 'bug-world-04',
      x: 220,
      y: 280,
      name: 'KeyError Goblin',
      tier: 'common',
      level: 13,
      errorType: 'KeyError',
      sprite: 'syntax',
    },
  ]);

  // Combat state
  const [activeBug, setActiveBug] = useState<WorldBug | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<BugEncounter | null>(null);
  const [isCombatLoading, setIsCombatLoading] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showBreakpointDebugger, setShowBreakpointDebugger] = useState<boolean>(false);

  // FX & UI flags
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [radarActive, setRadarActive] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [aiStatus, setAiStatus] = useState(getGenerationStatus());
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [projectile, setProjectile] = useState<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    type: 'laser' | 'grenade';
  } | null>(null);

  // Check backend Gemini API status on mount
  useEffect(() => {
    checkServerStatus().then((s) => setAiStatus(s));
  }, []);

  // Title calculation helper
  const getRankTitle = (lvl: number): string => {
    if (lvl < 5) return 'Intern Coder';
    if (lvl < 10) return 'Junior Bugcatcher';
    if (lvl < 15) return 'Junior Dev';
    if (lvl < 20) return 'Mid-Level Dev';
    if (lvl < 25) return 'Senior Code Slayer';
    return 'Principal Architect';
  };

  // Trigger Combat Encounter
  const handleEncounterBug = useCallback(async (bug: WorldBug) => {
    setActiveBug(bug);
    setIsCombatLoading(true);
    setEliminatedOptions([]);
    setShowBreakpointDebugger(false);

    try {
      const { encounter } = await fetchBugEncounter(bug.level, bug.tier, bug.errorType);
      setCurrentEncounter(encounter);
    } catch (_) {
      // Fallback handled in service
    } finally {
      setIsCombatLoading(false);
    }
  }, []);

  // Solve Bug (Correct fix picked)
  const handleSolveBug = (chosen: BugOption) => {
    if (!activeBug || !currentEncounter) return;

    const earnedXp = chosen.xp;
    const earnedGold = chosen.gold;

    // Remove bug from map
    setBugs((prev) => prev.filter((b) => b.id !== activeBug.id));
    setActiveBug(null);
    setCurrentEncounter(null);

    // Update player progression
    setStats((prev) => {
      let newXp = prev.xp + earnedXp;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let newHp = prev.hp;
      let newMaxHp = prev.maxHp;
      let newLinterGems = prev.linterGems;

      // Check level up
      if (newXp >= newMaxXp) {
        newLevel += 1;
        newXp = newXp - newMaxXp;
        newMaxXp = Math.round(newMaxXp * 1.3);
        newMaxHp += 20;
        newHp = newMaxHp; // Full heal
        newLinterGems += 1; // Bonus perk gem

        const newTitle = getRankTitle(newLevel);
        sound.playLevelUp();
        setLevelUpData({ level: newLevel, title: newTitle });
      }

      return {
        ...prev,
        level: newLevel,
        title: getRankTitle(newLevel),
        xp: newXp,
        maxXp: newMaxXp,
        hp: Math.min(newMaxHp, newHp + 5), // Slight combat heal
        maxHp: newMaxHp,
        gold: prev.gold + earnedGold,
        linterGems: newLinterGems,
        bugsSlain: prev.bugsSlain + 1,
        bossesDefeated: prev.bossesDefeated + (activeBug.tier === 'boss' ? 1 : 0),
      };
    });

    // Respawn a new bug elsewhere after 3 seconds to keep city bustling
    setTimeout(() => {
      const roadXCoords = [180, 360, 480, 580, 720, 840, 1020];
      const roadYCoords = [280, 320, 360, 180, 480];
      const randomX = roadXCoords[Math.floor(Math.random() * roadXCoords.length)];
      const randomY = roadYCoords[Math.floor(Math.random() * roadYCoords.length)];

      const isMini = Math.random() < 0.25;
      const newBug: WorldBug = {
        id: `bug-${Date.now()}`,
        x: randomX,
        y: randomY,
        name: isMini ? 'Infinite Loop Specter' : 'Syntax Error',
        tier: isMini ? 'miniboss' : 'common',
        level: stats.level + Math.floor(Math.random() * 3),
        errorType: isMini ? 'InfiniteLoop' : 'SyntaxError',
        sprite: isMini ? 'slime' : 'syntax',
      };
      setBugs((prev) => [...prev, newBug]);
    }, 3000);
  };

  // Fail Bug (Wrong option picked)
  const handleFailBug = (_chosen: BugOption) => {
    // Screen shake & damage deduction
    setStats((prev) => {
      const newHp = Math.max(0, prev.hp - 15);
      if (newHp <= 0) {
        // Revive with safety penalty
        setTimeout(() => {
          alert('SYSTEM CRASHED! Restoring from last stable commit (-50 Gold)...');
          setStats((s) => ({ ...s, hp: s.maxHp, gold: Math.max(0, s.gold - 50) }));
          setActiveBug(null);
          setCurrentEncounter(null);
        }, 300);
      }
      return { ...prev, hp: newHp };
    });
  };

  // Run from encounter
  const handleRunCombat = () => {
    sound.playStep();
    setActiveBug(null);
    setCurrentEncounter(null);
    // Push player slightly back
    setPlayerPos((prev) => ({
      ...prev,
      x: Math.max(80, Math.min(1100, prev.x + (prev.dir === 'left' ? 40 : -40))),
      y: Math.max(80, Math.min(520, prev.y + (prev.dir === 'up' ? 40 : -40))),
    }));
  };

  // Perk 1: Refactor Gun
  const handleUseRefactorGun = () => {
    sound.playLaser();

    if (currentEncounter) {
      // In combat: eliminate 1 incorrect option!
      const wrongIndices = currentEncounter.options
        .map((opt, i) => (!opt.isCorrect ? i : -1))
        .filter((i) => i !== -1 && !eliminatedOptions.includes(i));

      if (wrongIndices.length > 0) {
        const toEliminate = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        setEliminatedOptions((prev) => [...prev, toEliminate]);
      }
    } else {
      // On map: fire laser at closest bug!
      if (bugs.length === 0) return;
      let closest = bugs[0];
      let minD = 999999;
      bugs.forEach((b) => {
        const d = Math.hypot(b.x - playerPos.x, b.y - playerPos.y);
        if (d < minD) {
          minD = d;
          closest = b;
        }
      });

      setProjectile({
        x: playerPos.x,
        y: playerPos.y,
        targetX: closest.x,
        targetY: closest.y,
        type: 'laser',
      });

      setTimeout(() => {
        setProjectile(null);
        // Eliminate common bug if close enough
        if (minD < 320 && closest.tier === 'common') {
          setBugs((prev) => prev.filter((b) => b.id !== closest.id));
          setStats((s) => ({
            ...s,
            gold: s.gold + 20,
            xp: s.xp + 60,
            bugsSlain: s.bugsSlain + 1,
          }));
        }
      }, 250);
    }
  };

  // Perk 2: Breakpoints
  const handleUseBreakpoints = () => {
    sound.playScan();
    setShowBreakpointDebugger(true);
  };

  // Perk 3: Linter Grenade
  const handleUseLinterGrenade = () => {
    if (stats.linterGems <= 0) {
      alert('No Linter Gems remaining! Level up to acquire more.');
      return;
    }

    sound.playGrenade();
    setStats((s) => ({ ...s, linterGems: Math.max(0, s.linterGems - 1) }));

    if (currentEncounter) {
      // In combat: auto-format correct option!
      const correctOpt = currentEncounter.options.find((o) => o.isCorrect) || currentEncounter.options[0];
      handleSolveBug(correctOpt);
    } else {
      // On map: throw grenade destroying nearest common bug!
      if (bugs.length === 0) return;
      const target = bugs[0];
      setProjectile({
        x: playerPos.x,
        y: playerPos.y,
        targetX: target.x,
        targetY: target.y,
        type: 'grenade',
      });

      setTimeout(() => {
        setProjectile(null);
        setBugs((prev) => prev.filter((b) => b.id !== target.id));
        setStats((s) => ({
          ...s,
          gold: s.gold + 30,
          xp: s.xp + 90,
          bugsSlain: s.bugsSlain + 1,
        }));
      }, 350);
    }
  };

  // Action button: Scan Area
  const handleScanArea = () => {
    setRadarActive(true);
    setTimeout(() => setRadarActive(false), 1200);
  };

  // Action button: Start Exploring (Auto-walk step towards closest bug)
  const handleStartExploring = () => {
    if (bugs.length === 0) return;
    const target = bugs[0];
    const dx = target.x - playerPos.x;
    const dy = target.y - playerPos.y;

    setPlayerPos((prev) => ({
      ...prev,
      x: prev.x + Math.sign(dx) * 35,
      y: prev.y + Math.sign(dy) * 35,
      dir: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up',
      isMoving: true,
    }));
    sound.playStep();
  };

  // Spawn Production Outage Leviathan Boss
  const handleSpawnLeviathanBoss = () => {
    const bossExists = bugs.some((b) => b.tier === 'boss');
    if (!bossExists) {
      const boss: WorldBug = {
        id: `boss-leviathan-${Date.now()}`,
        x: 600,
        y: 220,
        name: 'Production Outage Leviathan',
        tier: 'boss',
        level: 25,
        errorType: 'ProductionOutage',
        sprite: 'boss_leviathan',
      };
      setBugs((prev) => [boss, ...prev]);
      sound.playEncounter();
    }
  };

  // Compass Calculation: direction from player to nearest bug
  const getCompassTarget = () => {
    if (bugs.length === 0) return 'E';
    let nearest = bugs[0];
    let minD = 999999;
    bugs.forEach((b) => {
      const d = Math.hypot(b.x - playerPos.x, b.y - playerPos.y);
      if (d < minD) {
        minD = d;
        nearest = b;
      }
    });

    const angle = Math.atan2(nearest.y - playerPos.y, nearest.x - playerPos.x) * (180 / Math.PI);
    if (angle >= -45 && angle <= 45) return 'E';
    if (angle > 45 && angle < 135) return 'S';
    if (angle >= 135 || angle <= -135) return 'W';
    return 'N';
  };

  const isBossNear = bugs.some((b) => b.tier === 'boss');

  // D-Pad Touch/Click Navigation
  const handleDPadMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (currentEncounter) return;
    const step = 28;
    setPlayerPos((prev) => {
      let nx = prev.x;
      let ny = prev.y;
      if (dir === 'up') ny -= step;
      if (dir === 'down') ny += step;
      if (dir === 'left') nx -= step;
      if (dir === 'right') nx += step;

      sound.playStep();
      return {
        x: Math.max(40, Math.min(1160, nx)),
        y: Math.max(40, Math.min(560, ny)),
        dir,
        isMoving: true,
      };
    });
  };

  return (
    <div className="bg-[#120724] text-white flex items-center justify-center min-h-screen p-2 sm:p-4 select-none overflow-x-hidden font-pixel">
      {/* BEGIN: Arcade Cabinet Container */}
      <div className="relative w-full max-w-[1408px] aspect-[1408/768] min-h-[720px] bg-[#220c38] rounded-2xl neon-border-pink p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(255,0,127,0.4)]">
        {/* CRT Scanline Screen Overlay */}
        {crtEnabled && <div className="scanlines absolute inset-0 z-50"></div>}

        {/* Level Up Fanfare Overlay */}
        {levelUpData && (
          <LevelUpBanner
            level={levelUpData.level}
            title={levelUpData.title}
            onDismiss={() => setLevelUpData(null)}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          status={aiStatus}
          onRefreshStatus={() => setAiStatus(getGenerationStatus())}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(!crtEnabled)}
          onSpawnBoss={handleSpawnLeviathanBoss}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = sound.toggleMute();
            setIsMuted(muted);
          }}
        />

        {/* BEGIN: Corner Arcade Emblems */}
        {/* Top-Left Corner: Palm Tree */}
        <div className="absolute top-2 left-2 w-10 h-10 bg-[#160626] border-2 border-[#00f3ff] rounded flex items-center justify-center text-xl shadow-[0_0_10px_#00f3ff] z-40">
          <span className="filter drop-shadow-[0_0_5px_#00f3ff]">🌴</span>
        </div>
        {/* Top-Right Corner: Skull */}
        <div className="absolute top-2 right-2 w-10 h-10 bg-[#160626] border-2 border-[#00f3ff] rounded flex items-center justify-center text-xl shadow-[0_0_10px_#00f3ff] z-40">
          <span className="filter drop-shadow-[0_0_5px_#00f3ff]">💀</span>
        </div>
        {/* Bottom-Left Corner: Pink Palm Tree */}
        <div className="absolute bottom-2 left-2 w-10 h-10 bg-[#160626] border-2 border-[#ff007f] rounded flex items-center justify-center text-xl shadow-[0_0_10px_#ff007f] z-40">
          <span className="filter drop-shadow-[0_0_5px_#ff007f]">🌴</span>
        </div>
        {/* Bottom-Right Corner: Pink Skull */}
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#160626] border-2 border-[#ff007f] rounded flex items-center justify-center text-xl shadow-[0_0_10px_#ff007f] z-40">
          <span className="filter drop-shadow-[0_0_5px_#ff007f]">💀</span>
        </div>
        {/* END: Corner Arcade Emblems */}

        {/* BEGIN: Top HUD & Marquee Header */}
        <header className="relative w-full z-30 px-6 sm:px-12 pt-1 pb-2 flex flex-col items-center">
          {/* Top Center Marquee Badge */}
          <div className="relative -top-1 bg-gradient-to-r from-[#ff007f] via-[#ffe600] to-[#ff007f] p-[3px] rounded-full shadow-[0_0_20px_#ff007f]">
            <div className="bg-[#2a0845] px-6 sm:px-8 py-1.5 rounded-full flex items-center gap-3 border-2 border-[#ffb6d9]">
              <span className="text-lg sm:text-2xl font-bold tracking-wider text-[#ffe600] neon-text-gold">
                PYTHON QUEST
              </span>
              <span className="text-[9px] sm:text-[10px] bg-[#ff007f] text-white px-2 py-0.5 rounded-full border border-pink-300">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Main Status Banner Bar (Left, Center Compass, Right Stats) */}
          <div className="w-full grid grid-cols-12 items-center mt-1">
            {/* Left Section: Avatar, Level, XP, HP */}
            <div className="col-span-4 flex items-center gap-3">
              {/* Pixel Avatar Container */}
              <div className="w-12 h-12 bg-[#19062e] border-2 border-[#00f3ff] rounded flex items-center justify-center shadow-[0_0_8px_#00f3ff] relative overflow-hidden flex-shrink-0">
                <div className="w-8 h-8 rounded bg-[#4b3d75] relative flex flex-col items-center justify-end">
                  <div className="w-5 h-5 bg-[#ffc3a0] rounded-sm relative -top-1">
                    <div className="w-full h-2 bg-[#5c3719] rounded-t-sm"></div>
                    <div className="flex justify-around mt-1">
                      <div className="w-1 h-1 bg-black"></div>
                      <div className="w-1 h-1 bg-black"></div>
                    </div>
                  </div>
                  <div className="w-7 h-3 bg-[#1e293b]"></div>
                </div>
              </div>

              {/* Stats Bars */}
              <div className="flex flex-col gap-1 w-full text-[9px] leading-tight">
                <div className="text-[#00f3ff] tracking-wide font-bold">
                  Level: {stats.level} ({stats.title})
                </div>

                {/* XP Progress Bar */}
                <div className="w-36 sm:w-48 h-3.5 bg-[#090214] border border-[#00f3ff] p-0.5 relative rounded-sm">
                  <div
                    style={{ width: `${Math.min(100, (stats.xp / stats.maxXp) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00f3ff] shadow-[0_0_8px_#00f3ff] transition-all duration-300"
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[7.5px] text-white font-bold drop-shadow">
                    XP Bar: {stats.xp}/{stats.maxXp}
                  </span>
                </div>

                {/* Health Hearts */}
                <div className="flex items-center gap-1.5 text-[8.5px]">
                  <span className="text-white font-bold">HP: {stats.hp}/{stats.maxHp}</span>
                  <div className="flex gap-1 text-[#ff0044] text-xs">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const hpPercent = (stats.hp / stats.maxHp) * 5;
                      return <span key={i}>{i < hpPercent ? '❤️' : '💔'}</span>;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section: Bug Tracker Compass */}
            <div className="col-span-4 flex justify-center items-center">
              <div
                title="Nearest Bug Compass Tracker"
                className="bg-[#150428]/80 border border-[#9b5de5] px-4 py-1 rounded flex items-center gap-3 text-[10px] text-purple-300 tracking-widest shadow-[0_0_10px_rgba(155,93,229,0.3)]"
              >
                <span className={`font-bold ${getCompassTarget() === 'N' ? 'text-yellow-300 font-extrabold' : 'text-white'}`}>N</span>
                <span className="text-xs">─</span>
                <span className={`font-bold ${getCompassTarget() === 'E' ? 'text-cyan-400 font-extrabold' : 'text-cyan-400'}`}>E</span>
                <span>🐞</span>
                <span>🪲</span>
                <span className="text-xs">─</span>
                <span className={`font-bold ${getCompassTarget() === 'W' ? 'text-yellow-300 font-extrabold' : 'text-white'}`}>W</span>
              </div>
            </div>

            {/* Right Section: Controls, Gold, Active Perks, Boss Near Warning */}
            <div className="col-span-4 flex items-center justify-end gap-3 sm:gap-4 text-[9px]">
              {/* Control Buttons: Sound, Config, AI */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const muted = sound.toggleMute();
                    setIsMuted(muted);
                  }}
                  title="Toggle 8-bit Audio"
                  className="w-5 h-5 bg-[#2c0b4d] border border-[#a259ff] rounded text-[8px] flex items-center justify-center hover:bg-[#3d1266] transition"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  title="Arcade Settings & Controls"
                  className="w-5 h-5 bg-[#2c0b4d] border border-[#a259ff] rounded text-[8px] flex items-center justify-center hover:bg-[#3d1266] transition"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  title="Gemini 3.8 Flash Engine Status"
                  className={`w-6 h-5 bg-[#2c0b4d] border rounded text-[7.5px] flex items-center justify-center font-bold ${
                    aiStatus.hasServerKey
                      ? 'border-[#00f3ff] text-[#00f3ff]'
                      : 'border-amber-400 text-amber-400'
                  }`}
                >
                  AI
                </button>
              </div>

              {/* Gold Tracker */}
              <div className="flex items-center gap-1 text-[#ffe600]">
                <span className="text-xs">🪙</span>
                <span>Gold: <strong className="text-white">{stats.gold}</strong></span>
              </div>

              {/* Active Perks */}
              <div className="flex items-center gap-1">
                <span className="text-gray-300 hidden sm:inline">Active Perks:</span>
                <div
                  title="Active Defensive Perk: Lint Shield & Auto-Format Ready"
                  className="w-5 h-5 bg-[#0e1d3b] border border-[#00f3ff] rounded flex items-center justify-center text-[9px] shadow-[0_0_6px_#00f3ff]"
                >
                  🛡️
                </div>
              </div>

              {/* BOSS NEAR Warning Alert */}
              <div
                onClick={handleSpawnLeviathanBoss}
                title="Click to summon or focus Leviathan Boss"
                className={`bg-[#380612] border border-[#ff0044] px-2.5 py-1 rounded flex items-center gap-1 text-[#ff0044] shadow-[0_0_12px_#ff0044] cursor-pointer hover:bg-red-950 transition ${
                  isBossNear ? 'animate-pulse' : 'opacity-85'
                }`}
              >
                <span className="text-[7px]">▲</span>
                <span className="font-bold tracking-wider neon-text-red text-[8px]">BOSS NEAR</span>
                <span className="text-[7px]">▼</span>
              </div>
            </div>
          </div>
        </header>
        {/* END: Top HUD & Marquee Header */}

        {/* BEGIN: Main Gameplay Viewport (Glitch City Overworld) */}
        <main className="relative flex-1 mx-4 sm:mx-12 rounded-lg border-4 border-[#00f3ff] overflow-hidden bg-[#24422e] shadow-[inset_0_0_20px_#000000,0_0_15px_#00f3ff] flex items-center">
          {/* Top-down Overworld Canvas */}
          <CityMapCanvas
            playerPos={playerPos}
            setPlayerPos={setPlayerPos}
            bugs={bugs}
            onEncounterBug={handleEncounterBug}
            isCombatActive={Boolean(currentEncounter)}
            radarActive={radarActive}
            projectile={projectile}
          />

          {/* Combat Bug Encounter Modal Overlay (Left side floating, exact replica) */}
          {currentEncounter && (
            <CombatModal
              encounter={currentEncounter}
              onSolve={handleSolveBug}
              onFail={handleFailBug}
              onRun={handleRunCombat}
              linterGems={stats.linterGems}
              onUseLinterGem={() => setStats((s) => ({ ...s, linterGems: Math.max(0, s.linterGems - 1) }))}
              eliminatedOptionIndices={eliminatedOptions}
              showBreakpointDebugger={showBreakpointDebugger}
            />
          )}

          {/* Combat Loading Spinner */}
          {isCombatLoading && (
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 bg-black/80 border-2 border-[#00f3ff] p-3 rounded text-[9px] text-[#00f3ff] font-pixel z-40 animate-pulse">
              ANALYZING TRACEBACK WITH GEMINI 3.8 FLASH...
            </div>
          )}

          {/* Map Toggle Switch (Bottom-Right of Gameplay Screen) */}
          <div
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="absolute bottom-2 right-2 z-20 bg-black/80 border border-cyan-400 px-2 py-0.5 rounded text-[8px] flex items-center gap-1.5 cursor-pointer hover:bg-black transition"
          >
            <span className="text-cyan-300 font-bold">MAP</span>
            <div
              className={`w-5 h-2.5 rounded-full flex items-center px-0.5 transition ${
                isMapExpanded ? 'bg-pink-500 justify-start' : 'bg-cyan-500 justify-end'
              }`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </main>
        {/* END: Main Gameplay Viewport */}

        {/* BEGIN: Bottom Controls & HUD Area */}
        <footer className="relative w-full z-30 px-6 sm:px-12 pt-2 flex items-center justify-between">
          {/* Left: Hotbar Items & Tools */}
          <div className="flex items-center gap-2">
            {/* Weapon Slot 1: Refactor Gun */}
            <div
              onClick={handleUseRefactorGun}
              title="Click or press [1]: Eliminate 1 wrong option in combat or fire laser on map"
              className="bg-[#140628] border-2 border-[#00f3ff] rounded p-1.5 flex flex-col items-center gap-1 w-16 sm:w-20 shadow-[0_0_8px_rgba(0,243,255,0.4)] cursor-pointer hover:border-pink-500 active:scale-95 transition"
            >
              <div className="text-base">🔫</div>
              <span className="text-[7px] sm:text-[7.5px] text-center text-cyan-300 font-bold leading-tight">
                Refactor<br />Gun
              </span>
            </div>

            {/* Weapon Slot 2: Breakpoints */}
            <div
              onClick={handleUseBreakpoints}
              title="Click or press [2]: Reveal live debugger and variable scope in combat"
              className="bg-[#140628] border-2 border-[#ff007f] rounded p-1.5 flex flex-col items-center gap-1 w-16 sm:w-20 shadow-[0_0_8px_rgba(255,0,127,0.4)] cursor-pointer hover:border-cyan-400 active:scale-95 transition"
            >
              <div className="text-base">🛠️</div>
              <span className="text-[7px] sm:text-[7.5px] text-center text-pink-300 font-bold leading-tight">
                Breakpoints
              </span>
            </div>

            {/* Weapon Slot 3: Linter Grenade */}
            <div
              onClick={handleUseLinterGrenade}
              title={`Click or press [3]: Instantly auto-formats bug or destroys closest bug (${stats.linterGems} gems left)`}
              className="bg-[#140628] border-2 border-[#00f3ff] rounded p-1.5 flex flex-col items-center gap-1 w-16 sm:w-20 shadow-[0_0_8px_rgba(0,243,255,0.4)] cursor-pointer hover:border-pink-500 active:scale-95 transition"
            >
              <div className="text-base">💣</div>
              <span className="text-[7px] sm:text-[7.5px] text-center text-cyan-300 font-bold leading-tight">
                Linter<br />Grenade ({stats.linterGems})
              </span>
            </div>
          </div>

          {/* Center: Action Explore Buttons & Retro D-Pad Controller */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Action Control Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartExploring}
                className="bg-[#00f3ff]/20 hover:bg-[#00f3ff]/40 border-2 border-[#00f3ff] text-[#00f3ff] px-4 sm:px-6 py-2 rounded text-[9px] sm:text-[10px] font-bold tracking-wider arcade-btn shadow-[0_0_12px_#00f3ff]"
              >
                START EXPLORING
              </button>
              <button
                onClick={handleScanArea}
                className="bg-[#19062e] hover:bg-[#2c0b4d] border-2 border-[#00f3ff] text-white px-4 sm:px-6 py-1.5 rounded text-[8px] sm:text-[9px] font-bold tracking-wider arcade-btn"
              >
                SCAN AREA
              </button>
            </div>

            {/* Chunky 4-Way Retro D-Pad Controller */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => handleDPadMove('up')}
                className="absolute top-0 w-6 h-7 bg-[#0b1b38] border-2 border-[#00f3ff] rounded-t flex items-center justify-center text-[8px] text-[#00f3ff] arcade-btn hover:bg-[#00f3ff] hover:text-black"
              >
                ▲
              </button>
              {/* Down */}
              <button
                onClick={() => handleDPadMove('down')}
                className="absolute bottom-0 w-6 h-7 bg-[#0b1b38] border-2 border-[#00f3ff] rounded-b flex items-center justify-center text-[8px] text-[#00f3ff] arcade-btn hover:bg-[#00f3ff] hover:text-black"
              >
                ▼
              </button>
              {/* Left */}
              <button
                onClick={() => handleDPadMove('left')}
                className="absolute left-0 w-7 h-6 bg-[#0b1b38] border-2 border-[#00f3ff] rounded-l flex items-center justify-center text-[8px] text-[#00f3ff] arcade-btn hover:bg-[#00f3ff] hover:text-black"
              >
                ◀
              </button>
              {/* Right */}
              <button
                onClick={() => handleDPadMove('right')}
                className="absolute right-0 w-7 h-6 bg-[#0b1b38] border-2 border-[#00f3ff] rounded-r flex items-center justify-center text-[8px] text-[#00f3ff] arcade-btn hover:bg-[#00f3ff] hover:text-black"
              >
                ▶
              </button>
              {/* Center Joint Hub */}
              <div className="w-6 h-6 bg-[#00f3ff] shadow-[0_0_6px_#00f3ff]"></div>
            </div>
          </div>

          {/* Right: Framed Minimap HUD Widget */}
          <MinimapWidget playerPos={playerPos} bugs={bugs} />
        </footer>
        {/* END: Bottom Controls & HUD Area */}
      </div>
      {/* END: Arcade Cabinet Container */}
    </div>
  );
}
