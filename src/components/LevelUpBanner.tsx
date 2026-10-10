import React from 'react';

interface LevelUpBannerProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

export const LevelUpBanner: React.FC<LevelUpBannerProps> = ({ level, title, onDismiss }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <div className="relative bg-[#220c38] border-4 border-[#ffe600] rounded-xl p-6 flex flex-col items-center gap-3 shadow-[0_0_40px_#ffe600] animate-bounce max-w-sm text-center">
        <div className="text-3xl filter drop-shadow-[0_0_10px_#ffe600]">⭐ 🚀 ⭐</div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#ffe600] neon-text-gold tracking-widest">
          LEVEL UP!
        </h2>
        <div className="text-sm font-bold text-[#00f3ff]">
          LEVEL {level} UNLOCKED
        </div>
        <div className="text-[10px] text-pink-300 font-code bg-black/60 px-3 py-1.5 rounded border border-pink-500">
          RANK PROMOTED: <strong className="text-white">{title}</strong>
        </div>
        <p className="text-[8.5px] text-gray-300 font-pixel leading-relaxed">
          +20 MAX HP & FULL RESTORE!<br />
          +1 LINTER GRENADE REFILLED!<br />
          CITY REPUTATION BOOSTED!
        </p>
        <button
          onClick={onDismiss}
          className="mt-2 bg-[#ffe600] hover:bg-[#ffd000] text-black font-bold px-6 py-2 rounded text-[10px] tracking-wider arcade-btn border-2 border-black"
        >
          CLAIM REWARDS
        </button>
      </div>
    </div>
  );
};
