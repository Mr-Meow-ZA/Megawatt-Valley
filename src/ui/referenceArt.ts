import type { StaffMember, WeatherKind } from '../simulation/types';

export const ROLE_LABEL: Record<StaffMember['role'], string> = {
  technician: 'Technician', cleaner: 'Maintenance', engineer: 'Engineer', manager: 'Manager',
};

/** Original vector characters: readable illustrations without external requests. */
export function staffPortrait(role: StaffMember['role']): string {
  const palettes = {
    technician: ['#f5bd32', '#b96f43', '#2c4c6b', '#423024'],
    cleaner: ['#4485c9', '#edb484', '#377da7', '#6d4029'],
    engineer: ['#f4f0df', '#d99469', '#f5f0df', '#563b30'],
    manager: ['#314e70', '#b97650', '#4b718b', '#302c2e'],
  };
  const [hat, skin, shirt, hair] = palettes[role];
  const headwear = role === 'manager'
    ? `<path d="M40 49Q35 15 63 16Q91 11 94 46L83 39Q70 44 61 30L47 47Z" fill="${hair}"/>`
    : `<path d="M35 43Q38 12 65 12Q92 12 96 43Z" fill="${hat}"/><path d="M32 42Q65 35 100 43L99 50Q62 44 32 51Z" fill="${hat}"/><path d="M62 14L59 35" stroke="#ffffff88" stroke-width="5"/>`;
  const tool = role === 'technician'
    ? '<path d="M103 82L96 112" stroke="#7b8d96" stroke-width="7"/><path d="M98 82L95 73L104 69L109 75L106 85Z" fill="#b4c4c9"/>'
    : role === 'cleaner' ? '<path d="M99 74L105 125" stroke="#dfb16c" stroke-width="4"/><path d="M96 119L115 116L118 132L99 135Z" fill="#3b7d74"/>'
    : '<rect x="87" y="77" width="26" height="35" rx="3" fill="#24475d"/><rect x="91" y="82" width="18" height="23" rx="1" fill="#d4e9e8"/><path d="M95 88H106M95 93H103M95 98H107" stroke="#79bfa2" stroke-width="2"/>';
  return `<svg viewBox="0 0 132 148" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="coat-${role}" x2="1" y2="1"><stop stop-color="${shirt}"/><stop offset="1" stop-color="#244965"/></linearGradient></defs><ellipse cx="67" cy="140" rx="43" ry="6" fill="#66897333"/><path d="M48 110L45 133L61 133L66 112L70 134L86 134L84 108Z" fill="#365468"/><path d="M42 132L60 132L60 140L39 140ZM70 132L88 132L93 140L70 140Z" fill="#634b32"/><path d="M43 73Q63 66 85 73L97 107L84 115L44 112L33 95Z" fill="url(#coat-${role})"/><path d="M46 73L51 108M79 74L76 110" stroke="${role === 'technician' || role === 'cleaner' ? '#f9c540' : '#8fc3b1'}" stroke-width="8"/><path d="M34 79L27 101Q32 114 47 103L46 95L38 99L43 81" fill="${skin}"/><path d="M87 79L98 98L106 94L110 103Q98 116 89 105L79 89Z" fill="${skin}"/>${tool}<rect x="57" y="62" width="17" height="17" rx="6" fill="${skin}"/><ellipse cx="65" cy="49" rx="26" ry="27" fill="${skin}"/><ellipse cx="40" cy="53" rx="5" ry="7" fill="${skin}"/><ellipse cx="89" cy="53" rx="5" ry="7" fill="${skin}"/>${headwear}<ellipse cx="55" cy="51" rx="2.8" ry="4" fill="#263a42"/><ellipse cx="77" cy="51" rx="2.8" ry="4" fill="#263a42"/><path d="M57 65Q66 73 76 63" fill="none" stroke="#713e2e" stroke-width="2.6" stroke-linecap="round"/><path d="M65 52L62 60L69 60" fill="none" stroke="#b46e48" stroke-width="2"/>${role === 'engineer' ? '<path d="M44 48H60V59H44ZM70 48H86V59H70ZM60 52H70" fill="none" stroke="#3d5461" stroke-width="2.4"/>' : ''}</svg>`;
}

/** A small landscape whose sky follows the actual park weather and daylight. */
export function weatherLandscape(weather: WeatherKind, night: boolean): string {
  const storm = weather === 'hail' || weather === 'rain';
  const cloudy = weather !== 'clear';
  return `<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="320" height="120" fill="${night ? '#253f65' : storm ? '#637991' : '#86c7ed'}"/><circle cx="264" cy="25" r="17" fill="${night ? '#e4eccb' : '#ffe681'}"/><path d="M0 68L60 15L126 70L180 31L249 77L290 43L320 65V120H0Z" fill="${storm || night ? '#526c7c' : '#86a88a'}"/><path d="M60 15L43 40L57 35L66 42L78 36ZM180 31L165 48L180 44L194 49Z" fill="#e1ece6"/><path d="M0 88Q68 50 129 82T320 74V120H0Z" fill="${night ? '#466654' : '#96bb68'}"/><path d="M219 74Q196 86 244 103L231 120H265L272 103Q229 85 239 74Z" fill="#64b9d0"/><path d="M0 109L143 90L183 113L87 120H0Z" fill="#cbd29b"/><g fill="#306658"><path d="M22 75L10 103H35ZM47 65L32 101H62ZM285 70L270 105H300"/></g><g fill="#3573b9" stroke="#c9e4e9" stroke-width="1"><path d="M80 86L129 79L143 91L92 99Z"/><path d="M104 101L152 94L166 106L115 114Z"/></g><path d="M90 85L102 97M103 83L115 95M115 81L128 93M79 91L136 86M112 100L124 112M125 98L138 110M138 96L151 108" stroke="#b9d7df" stroke-width="1"/>${cloudy ? '<g fill="#d4dfe8"><ellipse cx="73" cy="29" rx="39" ry="12"/><circle cx="62" cy="20" r="14"/><circle cx="82" cy="22" r="12"/><ellipse cx="213" cy="38" rx="35" ry="11"/><circle cx="205" cy="28" r="13"/></g>' : ''}${storm ? '<path d="M73 43L65 56M92 41L84 54M207 52L199 65M228 49L220 62" stroke="#d5eaf4" stroke-width="2"/>' : ''}${weather === 'hail' ? '<path d="M170 37L158 59H174L160 80L189 53H175L187 37Z" fill="#ffe074"/>' : ''}</svg>`;
}
