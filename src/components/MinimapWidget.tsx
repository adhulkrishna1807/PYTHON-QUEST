import React from 'react';
import { WorldBug } from '../types/game';

interface MinimapWidgetProps {
  playerPos: { x: number; y: number };
  bugs: WorldBug[];
}

export const MinimapWidget: React.FC<MinimapWidgetProps> = ({ playerPos, bugs }) => {
  // Normalize player and bug coordinates into the 144x96 minimap space
  // World space is 1200 x 600
  const scaleX = 140 / 1200;
  const scaleY = 92 / 600;

  const playerMiniX = Math.max(4, Math.min(136, playerPos.x * scaleX));
  const playerMiniY = Math.max(4, Math.min(88, playerPos.y * scaleY));

  return (
    <div className="w-36 h-24 bg-[#140628] border-2 border-[#ff007f] rounded p-1 relative overflow-hidden shadow-[0_0_10px_#ff007f] select-none">
      <div className="w-full h-full bg-[#0a0314] relative rounded overflow-hidden">
        {/* Horizontal Road */}
        <div className="absolute top-[42%] left-0 right-0 h-1.5 bg-[#9b5de5]/90"></div>
        {/* Vertical Roads */}
        <div className="absolute top-0 bottom-0 left-[45%] w-1.5 bg-[#9b5de5]/90"></div>
        <div className="absolute top-0 bottom-0 left-[75%] w-1 bg-[#9b5de5]/60"></div>
        {/* Diagonal Neon Highway */}
        <div className="absolute top-0 right-0 w-28 h-1 bg-[#00f3ff] rotate-45 transform origin-top-right opacity-80"></div>

        {/* Bug Markers */}
        {bugs.map((b) => {
          const bx = Math.max(3, Math.min(137, b.x * scaleX));
          const by = Math.max(3, Math.min(89, b.y * scaleY));
          const isBoss = b.tier === 'boss';
          const isMini = b.tier === 'miniboss';

          return (
            <div
              key={b.id}
              style={{ left: `${bx}px`, top: `${by}px` }}
              title={b.name}
              className={`absolute -translate-x-1 -translate-y-1 rounded-full ${
                isBoss
                  ? 'w-3 h-3 bg-[#ff0044] shadow-[0_0_6px_#ff0044] animate-ping'
                  : isMini
                  ? 'w-2 h-2 bg-[#ffaa00] shadow-[0_0_4px_#ffaa00]'
                  : 'w-1.5 h-1.5 bg-[#00f3ff] shadow-[0_0_3px_#00f3ff]'
              }`}
            />
          );
        })}

        {/* Player Blip (Ping Ring + Solid Center) */}
        <div
          style={{ left: `${playerMiniX}px`, top: `${playerMiniY}px` }}
          className="absolute -translate-x-1 -translate-y-1 w-2.5 h-2.5 bg-[#00ff66] rounded-full border border-white animate-ping opacity-75"
        />
        <div
          style={{ left: `${playerMiniX}px`, top: `${playerMiniY}px` }}
          className="absolute -translate-x-1 -translate-y-1 w-2.5 h-2.5 bg-[#00ff66] rounded-full border border-white shadow-[0_0_6px_#00ff66]"
        />
      </div>
    </div>
  );
};
