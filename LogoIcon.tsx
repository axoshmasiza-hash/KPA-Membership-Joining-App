import React from 'react';

export const LogoIcon: React.FC<{ src: string; className?: string }> = ({ src, className }) => (
  <img src={src} alt="Komani Progress Action Logo" className={className} />
);
