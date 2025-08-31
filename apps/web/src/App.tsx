import React from "react";
import TopNav from "./components/TopNav";
import Hero from "./components/Hero"; // your merged phrase section
import MoodDial from "./components/MoodDial";
import MapView from "./components/MapView";

export default function App() {
  return (
    <>
      <TopNav />
      <Hero />
      <main className="content">
        <MoodDial />
        <MapView />
      </main>
    </>
  );
}
