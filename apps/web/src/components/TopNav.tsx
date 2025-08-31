import React from "react";

export default function TopNav() {
  return (
    <header style={{position:"sticky", top:0, zIndex:5, backdropFilter:"blur(8px)", background:"rgba(0,0,0,0.25)", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
      <div className="max" style={{height:56, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{fontWeight:800, letterSpacing:"-0.02em"}}>MicroMood</div>
      </div>
    </header>
  );
}
