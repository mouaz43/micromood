import React, { useState } from "react";

export default function TopNav({
  owner,
  onSetOwner,
}: {
  owner: boolean;
  onSetOwner: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  return (
    <nav className="topnav">
      <div className="brand">
        <span className="logomark" aria-hidden />
        <span className="logotype">MicroMood</span>
      </div>

      <div className="nav-actions">
        <button className={`owner-toggle ${owner ? "on" : "off"}`} onClick={() => setOpen((v) => !v)}>
          Owner mode: {owner ? "ON" : "OFF"}
        </button>
        {open && (
          <div className="owner-panel">
            <input
              placeholder="Enter owner key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <div className="row">
              <button onClick={() => onSetOwner(key)}>Enable</button>
              <button onClick={() => onSetOwner(null)}>Disable</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
