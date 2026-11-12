export function Mascot({ variant='full', className='' }: { variant?: 'full'|'mark'|'line'|'shop'; className?: string }) {
  if (variant === 'shop') return <svg className={className} viewBox="0 0 112 112" aria-hidden="true">
    <path d="M18 30 29 10h54l12 20Z" fill="#A9D778" stroke="#252724" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M22 30h68v38H22Z" fill="#FFD7BD" stroke="#252724" strokeWidth="4"/>
    <path d="M18 30h15v13c0 7-4 11-8 11s-7-4-7-10V30Z" fill="#F05B60" stroke="#252724" strokeWidth="4"/>
    <path d="M33 30h15v13c0 7-3 11-8 11s-7-4-7-10V30Z" fill="#FFF" stroke="#252724" strokeWidth="4"/>
    <path d="M48 30h15v13c0 7-3 11-8 11s-7-4-7-10V30Z" fill="#F05B60" stroke="#252724" strokeWidth="4"/>
    <path d="M63 30h15v13c0 7-3 11-8 11s-7-4-7-10V30Z" fill="#FFF" stroke="#252724" strokeWidth="4"/>
    <path d="M78 30h16v13c0 7-4 11-8 11-5 0-8-4-8-10V30Z" fill="#F05B60" stroke="#252724" strokeWidth="4"/>
    <path d="M13 67h86v31H13Z" fill="#A9D778" stroke="#252724" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M27 98v8m58-8v8" stroke="#252724" strokeWidth="5" strokeLinecap="round"/>
    <text x="56" y="87" fill="#252724" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing=".5">TUCK SHOP</text>
  </svg>

  if (variant === 'mark') return <svg className={className} viewBox="0 0 112 112" aria-hidden="true">
    <circle cx="24" cy="29" r="17" fill="#3F423E"/>
    <circle cx="88" cy="29" r="17" fill="#3F423E"/>
    <path d="M12 58c0-27 18-44 44-44s44 17 44 44-18 42-44 42S12 85 12 58Z" fill="#FFF"/>
    <ellipse cx="38" cy="56" rx="12" ry="17" fill="#3F423E" transform="rotate(19 38 56)"/>
    <ellipse cx="74" cy="56" rx="12" ry="17" fill="#3F423E" transform="rotate(-19 74 56)"/>
    <circle cx="42" cy="51" r="3.6" fill="#FFF"/>
    <circle cx="70" cy="51" r="3.6" fill="#FFF"/>
    <circle cx="28" cy="73" r="7" fill="#F4A8B5"/>
    <circle cx="84" cy="73" r="7" fill="#F4A8B5"/>
    <ellipse cx="56" cy="67" rx="5.5" ry="4" fill="#252724"/>
    <path d="M56 70c0 7-7 8-11 4m11-4c0 7 7 8 11 4" fill="none" stroke="#252724" strokeWidth="2.6" strokeLinecap="round"/>
  </svg>

  if (variant === 'line') return <svg className={className} viewBox="0 0 220 230" aria-hidden="true">
    <circle cx="61" cy="39" r="23" fill="#464843"/>
    <circle cx="160" cy="39" r="23" fill="#464843"/>
    <path d="M43 91c0-42 28-67 68-67s68 25 68 67c0 39-28 64-68 64S43 130 43 91Z" fill="#FFF" stroke="currentColor" strokeWidth="3"/>
    <ellipse cx="84" cy="87" rx="17" ry="24" fill="#464843" transform="rotate(20 84 87)"/>
    <ellipse cx="138" cy="87" rx="17" ry="24" fill="#464843" transform="rotate(-20 138 87)"/>
    <circle cx="89" cy="81" r="5" fill="#FFF"/><circle cx="133" cy="81" r="5" fill="#FFF"/>
    <ellipse cx="111" cy="108" rx="8" ry="5.5" fill="#292B28"/>
    <path d="M111 113c0 10-11 12-17 6m17-6c0 10 11 12 17 6" fill="none" stroke="#292B28" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M65 145c10-18 27-27 46-27s36 9 46 27l12 54H53l12-54Z" fill="#464843"/>
    <path d="M79 143c9 12 20 18 32 18s23-6 32-18c7 17 8 34 6 51H73c-2-17-1-34 6-51Z" fill="#FFF"/>
    <ellipse cx="61" cy="190" rx="29" ry="24" fill="#575954" transform="rotate(28 61 190)"/>
    <ellipse cx="161" cy="190" rx="29" ry="24" fill="#575954" transform="rotate(-28 161 190)"/>
    <path d="M124 194c14-36 27-72 39-108" fill="none" stroke="#6F9947" strokeWidth="9" strokeLinecap="round"/>
    <path d="M153 111c0-19 10-31 26-34 2 17-8 30-26 34Zm8-20c-9-13-7-26 3-35 11 11 10 25-3 35Zm-15 42c8-13 19-18 33-14-5 15-18 20-33 14Z" fill="#6F9947"/>
  </svg>

  return <svg className={className} viewBox="0 0 340 370" aria-hidden="true">
    <defs>
      <filter id="seatedPandaShadow" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#183326" floodOpacity=".14"/>
      </filter>
      <linearGradient id="bambooStem" x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#8BB454"/><stop offset="1" stopColor="#537F39"/>
      </linearGradient>
    </defs>

    <g filter="url(#seatedPandaShadow)">
      {/* Rounded ears remain visible behind the head */}
      <circle cx="87" cy="67" r="34" fill="#464843"/>
      <circle cx="251" cy="67" r="34" fill="#464843"/>

      {/* Seated charcoal body */}
      <path d="M91 190c13-32 40-51 78-51s65 19 78 51l19 93c6 31-17 57-49 57h-96c-32 0-55-26-49-57l19-93Z" fill="#464843"/>
      <path d="M105 205c13-22 35-34 64-34s51 12 64 34c7 25 7 53 0 79-9 32-30 45-64 45s-55-13-64-45c-7-26-7-54 0-79Z" fill="#FFF"/>

      {/* Wide, softly rounded face */}
      <path d="M62 128c0-58 42-93 107-93s107 35 107 93-41 91-107 91S62 186 62 128Z" fill="#FFF"/>

      {/* One-piece black eye patches with one white highlight */}
      <ellipse cx="126" cy="122" rx="25" ry="36" fill="#464843" transform="rotate(18 126 122)"/>
      <ellipse cx="212" cy="122" rx="25" ry="36" fill="#464843" transform="rotate(-18 212 122)"/>
      <circle cx="134" cy="111" r="7" fill="#FFF"/>
      <circle cx="204" cy="111" r="7" fill="#FFF"/>

      <ellipse cx="169" cy="151" rx="11" ry="8" fill="#292B28"/>
      <path d="M169 158c0 14-16 17-24 8m24-8c0 14 16 17 24 8" fill="none" stroke="#292B28" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="105" cy="158" r="15" fill="#F4A8B5" opacity=".72"/>
      <circle cx="233" cy="158" r="15" fill="#F4A8B5" opacity=".72"/>

      {/* Sitting legs and soft paw pads */}
      <ellipse cx="91" cy="308" rx="47" ry="37" fill="#575954" transform="rotate(28 91 308)"/>
      <ellipse cx="247" cy="308" rx="47" ry="37" fill="#575954" transform="rotate(-28 247 308)"/>
      <ellipse cx="91" cy="310" rx="10" ry="13" fill="#3D3F3B"/>
      <circle cx="76" cy="295" r="6" fill="#3D3F3B"/><circle cx="89" cy="290" r="6" fill="#3D3F3B"/><circle cx="102" cy="295" r="6" fill="#3D3F3B"/>
      <ellipse cx="247" cy="310" rx="10" ry="13" fill="#3D3F3B"/>
      <circle cx="232" cy="295" r="6" fill="#3D3F3B"/><circle cx="245" cy="290" r="6" fill="#3D3F3B"/><circle cx="258" cy="295" r="6" fill="#3D3F3B"/>

      {/* Arms wrap naturally around the bamboo */}
      <ellipse cx="135" cy="227" rx="43" ry="25" fill="#464843" transform="rotate(15 135 227)"/>
      <ellipse cx="206" cy="229" rx="34" ry="27" fill="#464843" transform="rotate(-18 206 229)"/>
    </g>

    {/* Bamboo sits in front of the paws */}
    <path d="M180 313c23-56 45-116 64-180" fill="none" stroke="url(#bambooStem)" strokeWidth="14" strokeLinecap="round"/>
    <path d="M232 171c-1-27 14-45 37-50 4 25-11 46-37 50Z" fill="#5C8B3D"/>
    <path d="M242 145c-13-21-10-41 5-55 16 18 14 39-5 55Z" fill="#77A649"/>
    <path d="M218 208c11-22 28-31 49-26-8 23-27 32-49 26Z" fill="#709E45"/>
    <path d="M250 126c7-22 22-34 41-33-2 22-18 35-41 33Z" fill="#4E7E38"/>
    <path d="M205 239c-1-22 10-37 29-42 4 21-8 38-29 42Z" fill="#80AA4E"/>
  </svg>
}
