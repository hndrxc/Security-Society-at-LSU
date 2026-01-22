"use client";
import Snowfall from "react-snowfall";

export default function SnowfallEffect() {
  return (
    <Snowfall
      color="rgba(255, 255, 255, 0.15)"
      snowflakeCount={100}
      style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }}
    />
  );
}
