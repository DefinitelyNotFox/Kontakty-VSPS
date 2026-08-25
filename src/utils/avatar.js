// Utilities for generating initial badges and visual helper styles for avatar contacts

// Soft modern gradient palettes
const GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', // Blue to Cyan
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald to Teal
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber to Orange
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', // Pink to Purple
  'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', // Sky to Blue
  'linear-gradient(135deg, #84cc16 0%, #10b981 100%)', // Lime to Emerald
  'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'  // Rose
];

export function getInitials(name) {
  if (!name) return '??';
  const cleanName = name
    .replace(/^(Mgr\.|Ing\.|Bc\.|PhDr\.|MgA\.|B\.A\.|MSc\.|doc\.|prof\.|PaedDr\.)\s*/gi, '')
    .trim();
  
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  const firstName = parts[parts.length - 1];
  const surname = parts[0];
  return `${surname[0] || ''}${firstName[0] || ''}`.toUpperCase();
}

export function getAvatarGradient(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function getCleanName(name) {
  if (!name) return '';
  return name
    .replace(/^(Mgr\.|Ing\.|Bc\.|PhDr\.|MgA\.|B\.A\.|MSc\.|doc\.|prof\.|PaedDr\.)\s*/gi, '')
    .trim();
}

export function getTitlePrefix(name) {
  if (!name) return '';
  const match = name.match(/^(Mgr\.|Ing\.|Bc\.|PhDr\.|MgA\.|B\.A\.|MSc\.|doc\.|prof\.|PaedDr\.)+/gi);
  return match ? match.join(' ') : '';
}

// Czech Gender Detection from full names (for quiz option filtering)
export function getGender(contact) {
  if (!contact || !contact.name) return 'male';
  
  const name = contact.name.toLowerCase().trim();

  // Known female first names and surname patterns in Czech
  const femaleIndicators = [
    'ová', 'ská', 'cká', 'ná',
    'barbora', 'ivona', 'alena', 'monika', 'jana', 'pavla',
    'marie', 'martina', 'petra', 'lenka', 'kateřina', 'zuzana',
    'soňa', 'iva', 'ivana', 'veronika', 'miroslava', 'zdeňka',
    'michaela', 'markéta', 'květa', 'dagmar', 'anna', 'barbora', 'ilona'
  ];

  const words = name.replace(/^(mgr\.|ing\.|bc\.|phdr\.|mga\.|b\.a\.|msc\.|doc\.|prof\.|paeddr\.)\s*/gi, '').split(/\s+/).filter(Boolean);
  
  for (const word of words) {
    if (femaleIndicators.some(ind => word.endsWith(ind) || word === ind)) {
      return 'female';
    }
  }

  return 'male';
}
