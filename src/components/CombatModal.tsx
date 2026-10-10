import React, { useState } from 'react';
import { BugEncounter, BugOption } from '../types/game';
import { sound } from '../services/audio';

interface CombatModalProps {
  encounter: BugEncounter;
  onSolve: (option: BugOption) => void;
  onFail: (option: BugOption) => void;
  onRun: () => void;
  linterGems: number;
  onUseLinterGem: () => void;
  eliminatedOptionIndices: number[];
  showBreakpointDebugger: boolean;
}

export const CombatModal: React.FC<CombatModalProps> = ({
  encounter,
  onSolve,
  onFail,
  onRun,
  linterGems,
  onUseLinterGem,
  eliminatedOptionIndices,
  showBreakpointDebugger,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongAttempt, setWrongAttempt] = useState<boolean>(false);
  const [attemptMessage, setAttemptMessage] = useState<string>('');

  const handleSelectOption = (idx: number) => {
    if (eliminatedOptionIndices.includes(idx)) return;
    setSelectedIdx(idx);
    setWrongAttempt(false);
  };

  const handleFight = () => {
    if (selectedIdx === null) {
      setAttemptMessage('Select a fix option first!');
      return;
    }

    const chosen = encounter.options[selectedIdx];
    if (chosen.isCorrect) {
      sound.playCorrect();
      onSolve(chosen);
    } else {
      sound.playWrong();
      setWrongAttempt(true);
      setAttemptMessage(`WRONG FIX! ${chosen.explanation}`);
      onFail(chosen);
    }
  };

  const handleAutoFormat = () => {
    if (linterGems <= 0) {
      setAttemptMessage('No Linter Gems left! Level up or defeat bugs to get more.');
      return;
    }
    const correctOpt = encounter.options.find((o) => o.isCorrect) || encounter.options[0];
    onUseLinterGem();
    sound.playCorrect();
    onSolve(correctOpt);
  };

  const tierColors = {
    common: 'border-[#ff007f] shadow-[0_0_25px_rgba(255,0,127,0.7)]',
    miniboss: 'border-[#ff7700] shadow-[0_0_25px_rgba(255,119,0,0.8)]',
    boss: 'border-[#ff0044] shadow-[0_0_35px_rgba(255,0,68,0.9)] animate-pulse',
  };

  return (
    <div className={`relative z-40 my-auto ml-2 sm:ml-4 w-[340px] sm:w-[380px] bg-[#140528]/95 border-2 rounded-lg p-3 shadow-2xl backdrop-blur-md select-none transition-all ${tierColors[encounter.tier]}`}>
      {/* Modal Window Header */}
      <div className="flex items-center justify-between border-b-2 border-[#ff007f] pb-1.5 mb-2">
        <div className="flex items-center gap-1.5 text-[#ff0055] font-bold text-[9px] tracking-wide neon-text-red">
          <span className="text-xs">⚠️</span>
          <span className="uppercase">{encounter.title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">
            {encounter.tier === 'boss' ? '💀' : encounter.tier === 'miniboss' ? '👀' : '🐞'}
          </span>
          <button
            onClick={onRun}
            title="Escape combat (Run)"
            className="w-4 h-4 bg-[#ff0044] text-white text-[9px] font-bold rounded flex items-center justify-center hover:bg-red-600 transition"
          >
            ×
          </button>
        </div>
      </div>

      {/* Breakpoint Debugger Panel (if active) */}
      {showBreakpointDebugger && (
        <div className="bg-[#051c24] border border-[#00f3ff] rounded p-1.5 mb-2 font-code text-[8px] text-[#00f3ff] shadow">
          <div className="flex items-center justify-between font-bold mb-1">
            <span>🛠️ DEBUGGER [PAUSED AT LINE 4]</span>
            <span className="text-[#00ff66]">LIVE INSPECT</span>
          </div>
          <div className="text-gray-300 grid grid-cols-2 gap-1 text-[7.5px]">
            <div>scope: &apos;local&apos;</div>
            <div>error_class: &apos;{encounter.errorType}&apos;</div>
            <div>stack_depth: 3</div>
            <div className="text-yellow-300">target: {encounter.glitchLine.substring(0, 18)}...</div>
          </div>
        </div>
      )}

      {/* Traceback Terminal Window */}
      <div className="bg-[#090214] border border-[#00f3ff] rounded p-2 font-code text-[8px] sm:text-[8.5px] leading-relaxed text-gray-200 mb-2 shadow-inner overflow-x-auto">
        <div className="text-[#a259ff] font-bold mb-1 flex items-center justify-between">
          <span>Traceback Terminal:</span>
          <span className="text-[7.5px] text-gray-500 font-normal">Python 3.12</span>
        </div>

        {encounter.traceback.map((line, idx) => (
          <p key={idx} className="text-gray-400 whitespace-pre">
            {line}
          </p>
        ))}

        {/* Glitching Highlighted Error Line */}
        <div className="bg-[#ffe600] text-black font-bold px-1.5 py-0.5 rounded-sm my-1 border border-yellow-400 shadow-[0_0_8px_#ffe600] whitespace-pre break-all animate-pulse">
          {encounter.glitchLine}
        </div>
      </div>

      {/* Error feedback alert if failed */}
      {wrongAttempt && (
        <div className="bg-red-950/80 border border-red-500 text-red-200 text-[8px] p-1.5 rounded mb-2 animate-shake">
          ⚠️ {attemptMessage}
        </div>
      )}

      {/* Fix Options Buttons */}
      <div className="flex flex-col gap-1.5 mb-2 text-[8px]">
        <div className="flex items-center justify-between text-gray-300 font-bold tracking-wide">
          <span>Fix Options:</span>
          <span className="text-[7.5px] text-gray-400 font-normal">Select 1 option to apply</span>
        </div>

        {encounter.options.map((option, idx) => {
          const isEliminated = eliminatedOptionIndices.includes(idx);
          const isSelected = selectedIdx === idx;

          return (
            <button
              key={idx}
              disabled={isEliminated}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-1.5 rounded flex items-center justify-between arcade-btn text-left transition ${
                isEliminated
                  ? 'bg-gray-900/60 border border-gray-700 text-gray-600 line-through cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#00f3ff]/20 border-2 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_#00f3ff]'
                  : 'bg-[#1b0a33] hover:bg-[#2c1252] border border-[#00f3ff]/60 text-[#00f3ff]'
              }`}
            >
              <span className="font-bold tracking-tight">{option.text}</span>
              <span className="text-[#00ff66] font-code font-bold text-[7.5px] sm:text-[8px]">
                +{option.xp} XP / +{option.gold}G
              </span>
            </button>
          );
        })}

        {/* Auto-Format Option Button */}
        <button
          onClick={handleAutoFormat}
          className="w-full bg-[#330524] hover:bg-[#4d0736] border border-[#ff007f] text-[#ff70a6] p-1.5 rounded flex items-center justify-between arcade-btn shadow-[0_0_6px_rgba(255,0,127,0.3)] transition"
        >
          <span className="font-bold flex items-center gap-1">
            <span>⚡</span>
            <span>[AUTO-FORMAT]</span>
          </span>
          <span className="text-pink-300 font-code text-[7.5px]">
            {linterGems > 0 ? `(Uses 1 Linter Gem • ${linterGems} left)` : '(No Gems Left)'}
          </span>
        </button>
      </div>

      {/* AI Assistant Suggestion Callout */}
      <div className="bg-[#0a1a2f] border border-[#00f3ff]/60 rounded p-1.5 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 max-w-[85%]">
          <span className="text-sm">💡</span>
          <div className="text-[7.5px] leading-tight">
            <span className="text-[#00f3ff] font-bold block">AI SUGGESTS:</span>
            <span className="text-gray-300 italic">{encounter.aiHint}</span>
          </div>
        </div>
        {/* Pixel Robot Helper Mascot */}
        <div className="w-7 h-7 bg-[#00f3ff]/20 border border-[#00f3ff] rounded flex items-center justify-center text-xs shadow-[0_0_6px_#00f3ff]">
          🤖
        </div>
      </div>

      {/* Bottom Action Modal Buttons (Fight / Run) */}
      <div className="grid grid-cols-2 gap-2 text-[9px]">
        <button
          onClick={handleFight}
          className="bg-[#00f3ff] hover:bg-[#00c8d4] text-black font-bold py-1.5 rounded text-center border-2 border-white arcade-btn shadow-[0_0_10px_#00f3ff]"
        >
          FIGHT!
        </button>
        <button
          onClick={onRun}
          className="bg-[#ff0044] hover:bg-[#d90429] text-white font-bold py-1.5 rounded text-center border-2 border-white arcade-btn shadow-[0_0_10px_#ff0044]"
        >
          RUN!
        </button>
      </div>
    </div>
  );
};
