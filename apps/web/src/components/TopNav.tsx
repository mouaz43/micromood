import React from "react";

export default function TopNav() {
  const [owner, setOwner] = React.useState(
    localStorage.getItem("mm_owner") === "1"
  );

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
      <a className="mm-logo text-white text-xl" href="/">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <defs>
            <radialGradient id="lg" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#fff" stopOpacity=".95"/>
              <stop offset="70%" stopColor="#a7f3d0" stopOpacity=".85"/>
              <stop offset="100%" stopColor="#c7ffe8" stopOpacity=".2"/>
            </radialGradient>
          </defs>
          <circle cx="18" cy="18" r="16" fill="#0b1221"/>
          <circle cx="18" cy="18" r="16" fill="url(#lg)"/>
          <circle cx="18" cy="18" r="15.2" fill="none" stroke="#a7f3d0" strokeOpacity=".35" strokeWidth=".8"/>
        </svg>
        <span>MicroMood</span>
      </a>

      <button
        className="badge"
        onClick={() => {
          const next = !owner;
          setOwner(next);
          localStorage.setItem("mm_owner", next ? "1" : "0");
        }}
        title="Owner mode lets you delete dots by token"
      >
        Owner mode: {owner ? "ON" : "OFF"}
      </button>
    </nav>
  );
}
