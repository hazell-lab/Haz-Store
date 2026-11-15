// svg icons, drawn once and reused with <Icon name="..." />
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z"/></symbol>
        <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8.5h14l-1.1 11.5H6.1L5 8.5Z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5"/></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16"/></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11m0-11-11 11"/></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13"/></symbol>
        <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5.5 12h13"/></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4.5 12h15m-5.5-5.5L19.5 12 14 17.5"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L12 3.8Z"/></symbol>
        <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2m0 15v2M4.6 4.6 6 6m12 12 1.4 1.4M2.5 12h2m15 0h2M4.6 19.4 6 18M18 6l1.4-1.4"/></symbol>
        <symbol id="i-moon" viewBox="0 0 24 24"><path d="M19.5 14.6A7.6 7.6 0 0 1 9.4 4.5a7.6 7.6 0 1 0 10.1 10.1Z"/></symbol>
        <symbol id="i-truck" viewBox="0 0 24 24"><path d="M3 6.5h11v10H3zM14 10h3.8l3.2 3.3v3.2h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 19 6v5.3c0 4.3-2.9 7.6-7 9.2-4.1-1.6-7-4.9-7-9.2V6l7-2.5Z"/><path d="m9 12 2 2 4-4"/></symbol>
        <symbol id="i-return" viewBox="0 0 24 24"><path d="M4.5 9.5H15a4.5 4.5 0 0 1 0 9H8.5"/><path d="M8.5 5.5 4.5 9.5l4 4"/></symbol>
        <symbol id="i-support" viewBox="0 0 24 24"><path d="M4 5.5h16v10.5H10l-6 4V5.5Z"/><path d="M8.5 10.5h7"/></symbol>
        <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 7.5h9m4 0h3M4 16.5h3m4 0h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/></symbol>
        <symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3 10h18M6.5 15h4"/></symbol>
        <symbol id="i-bank" viewBox="0 0 24 24"><path d="M3.5 9.5 12 4.5l8.5 5M5.5 10v7.5M10 10v7.5M14 10v7.5M18.5 10v7.5M3.5 20h17"/></symbol>
        <symbol id="i-cash" viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="11" rx="1.5"/><circle cx="12" cy="12" r="2.5"/></symbol>
        <symbol id="i-zoom" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name, className = "" }) {
  return (
    <svg className={"icon" + (className ? " " + className : "")} aria-hidden="true" focusable="false">
      <use href={"#i-" + name} />
    </svg>
  );
}

// inline plus so css can hide the vertical line when a details section is open
export function ToggleIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.5 12h13" />
      <path className="icon-plus-v" d="M12 5.5v13" />
    </svg>
  );
}
