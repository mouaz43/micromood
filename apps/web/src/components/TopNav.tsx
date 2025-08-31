import React from "react";
import { energyTint } from "../lib/moon";

export default function TopNav() {
  return (
    <header className="topnav">
      <a className="brand" href="/">
        <img src="/micromood-logo.svg" width={160} height={32} alt="MicroMood" />
      </a>
      <div className="spacer" />
      <a className="builtby" href="/" aria-label="Built by Mouaz Almjarkesh">
        <span>Built by </span><strong>Mouaz Almjarkesh</strong>
      </a>
      <style jsx>{`
        .topnav{
          display:flex;align-items:center;gap:16px;
          padding:16px 20px;position:sticky;top:0;z-index:50;
          background: linear-gradient(180deg, rgba(3,7,18,.85), rgba(3,7,18,.35) 60%, transparent);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(140,200,255,.06);
        }
        .brand{display:inline-flex;align-items:center;gap:10px}
        .spacer{flex:1}
        .builtby{font-size:13px;color:#cfe0ff;opacity:.8;text-decoration:none}
        .builtby strong{color:${energyTint(3)}}
      `}</style>
    </header>
  );
}
