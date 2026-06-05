import React from 'react';

export function MaleAvatar({ size = 48, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#E8EDF5"/>
      {/* Body - jacket */}
      <path d="M20 100 C20 75 30 68 50 65 C70 68 80 75 80 100Z" fill="#1E3A5F"/>
      {/* Shirt */}
      <path d="M38 65 L50 72 L62 65 L58 100 L42 100Z" fill="#D1DCF0"/>
      {/* Neck */}
      <rect x="43" y="55" width="14" height="14" rx="4" fill="#F5C5A3"/>
      {/* Head */}
      <ellipse cx="50" cy="42" rx="18" ry="20" fill="#F5C5A3"/>
      {/* Hair */}
      <path d="M32 38 C32 22 68 22 68 38 C68 30 64 23 50 22 C36 23 32 30 32 38Z" fill="#5C3D2E"/>
      <path d="M32 38 C30 35 30 28 36 24 C38 22 40 22 50 22 C60 22 62 22 64 24 C70 28 70 35 68 38" fill="#5C3D2E"/>
    </svg>
  );
}

export function FemaleAvatar({ size = 48, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#EEF0F8"/>
      {/* Body - jacket */}
      <path d="M18 100 C18 73 30 66 50 63 C70 66 82 73 82 100Z" fill="#4A5580"/>
      {/* Shirt */}
      <path d="M38 64 L50 70 L62 64 L59 100 L41 100Z" fill="#D8DCE8"/>
      {/* Neck */}
      <rect x="43" y="55" width="14" height="13" rx="4" fill="#F2C4A0"/>
      {/* Head */}
      <ellipse cx="50" cy="42" rx="17" ry="19" fill="#F2C4A0"/>
      {/* Hair - bob style */}
      <path d="M33 38 C33 20 67 20 67 38 C67 50 65 58 62 60 C62 50 68 42 68 34 C68 22 32 22 32 34 C32 42 38 50 38 60 C35 58 33 50 33 38Z" fill="#7A5C4E"/>
      {/* Hair sides */}
      <path d="M33 36 C31 40 31 52 34 58 C36 61 38 60 38 60 C35 54 33 46 33 36Z" fill="#7A5C4E"/>
      <path d="M67 36 C69 40 69 52 66 58 C64 61 62 60 62 60 C65 54 67 46 67 36Z" fill="#7A5C4E"/>
    </svg>
  );
}

export function getAvatar(index, size = 48, style) {
  return index % 2 === 0
    ? <MaleAvatar size={size} style={style} />
    : <FemaleAvatar size={size} style={style} />;
}

// Large versions for profile/detail pages
export function LargeMaleAvatar({ size = 80 }) {
  return <MaleAvatar size={size} />;
}

export function LargeFemaleAvatar({ size = 80 }) {
  return <FemaleAvatar size={size} />;
}
