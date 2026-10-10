import React from 'react';
import { GenerationStatus, toggleAiEnabled } from '../services/geminiService';
import { sound } from '../services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GenerationStatus;
  onRefreshStatus: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onSpawnBoss: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
  crtEnabled,
  onToggleCrt,
  onSpawnBoss,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-pixel text-white">
      <div className="relative w-full max-w-lg bg-[#180830] border-4 border-[#00f3ff] rounded-xl p-5 shadow-[0_0_30px_#00f3ff] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#00f3ff] pb-2">
          <div className="flex items-center gap-2 text-[#00f3ff] text-xs">
            <span>⚙️</span>
            <span className="tracking-wider">ARCADE SYSTEM CONFIG</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-[#ff0044] text-white text-xs font-bold rounded flex items-center justify-center hover:bg-red-600 transition"
          >
            ×
          </button>
        </div>

        {/* Gemini AI Status */}
        <div className="bg-[#0b1b38] border border-[#00f3ff] p-3 rounded text-[9px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#ffe600] font-bold">GEMINI 3.8 FLASH ENGINE</span>
            <span
              className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                status.hasServerKey ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {status.hasServerKey ? 'LIVE API READY' : 'OFFLINE BUG BANK ACTIVE'}
            </span>
          </div>
          <p className="text-gray-300 font-code text-[8.5px] leading-relaxed">
            {status.hasServerKey
              ? 'Gemini 3.8 Flash model powers dynamic Python bug scenarios with real-time generated code snippets and traceback terminal.'
              : 'App is running with built-in 20+ authentic Python bug scenarios (SyntaxError, IndentationError, Memory Leaks, Leviathan Boss).'}
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                toggleAiEnabled();
                onRefreshStatus();
              }}
              className="bg-[#2a0845] border border-[#ff007f] text-pink-300 hover:bg-[#4a0d78] px-3 py-1.5 rounded text-[8px] font-bold arcade-btn"
            >
              Mode: {status.isAiEnabled ? 'AI Generator Enabled' : 'Forced Offline Only'}
            </button>
            <button
              onClick={onSpawnBoss}
              className="bg-[#ff0044] hover:bg-[#d90429] text-white px-3 py-1.5 rounded text-[8px] font-bold arcade-btn flex items-center gap-1"
            >
              <span>💀</span>
              <span>SUMMON LEVIATHAN BOSS</span>
            </button>
          </div>
        </div>

        {/* Display & Audio Settings */}
        <div className="grid grid-cols-2 gap-3 text-[9px]">
          <div className="bg-[#120524] border border-[#a259ff] p-2.5 rounded flex flex-col justify-between gap-2">
            <span className="text-purple-300 font-bold">CRT SCANLINE EFFECT</span>
            <button
              onClick={onToggleCrt}
              className={`py-1.5 rounded font-bold arcade-btn border ${
                crtEnabled
                  ? 'bg-[#00f3ff] text-black border-white'
                  : 'bg-[#220c38] text-gray-400 border-gray-600'
              }`}
            >
              {crtEnabled ? 'CRT ON' : 'CRT OFF'}
            </button>
          </div>

          <div className="bg-[#120524] border border-[#a259ff] p-2.5 rounded flex flex-col justify-between gap-2">
            <span className="text-purple-300 font-bold">8-BIT AUDIO CHIP</span>
            <button
              onClick={onToggleMute}
              className={`py-1.5 rounded font-bold arcade-btn border ${
                !isMuted
                  ? 'bg-[#39ff14] text-black border-white'
                  : 'bg-[#220c38] text-gray-400 border-gray-600'
              }`}
            >
              {!isMuted ? 'SOUND: ON 🔊' : 'MUTED 🔇'}
            </button>
          </div>
        </div>

        {/* Controls Cheatsheet */}
        <div className="bg-[#090214] border border-gray-700 p-3 rounded text-[8px] font-code text-gray-300">
          <div className="text-[#00f3ff] font-bold mb-1.5 font-pixel text-[8.5px]">CONTROLS & PERKS</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div><strong className="text-white">WASD / Arrow Keys:</strong> Walk City</div>
            <div><strong className="text-white">D-Pad:</strong> On-Screen Movement</div>
            <div><strong className="text-white">Refactor Gun [1]:</strong> Strip Bad Fix</div>
            <div><strong className="text-white">Breakpoints [2]:</strong> Inspect Variables</div>
            <div><strong className="text-white">Linter Grenade [3]:</strong> Auto-Solve Bug</div>
            <div><strong className="text-white">Bump into Bug:</strong> Start Combat</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#00f3ff] hover:bg-[#00c8d4] text-black font-bold py-2 rounded text-[10px] tracking-wider arcade-btn border-2 border-white"
        >
          RESUME GAME
        </button>
      </div>
    </div>
  );
};
