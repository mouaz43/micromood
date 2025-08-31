import React from "react";

export default function TopNav() {
  return (
    <header className="topnav">
      <a className="brand" href="/" aria-label="MicroMood">
        <img src="/micromood-logo.svg" width={160} height={32} alt="MicroMood" />
      </a>
      <div className="spacer" />
      <a className="builtby" href="/" aria-label="Built by Mouaz Almjarkesh">
        Built by <strong>Mouaz Almjarkesh</strong>
      </a>
    </header>
  );
}
