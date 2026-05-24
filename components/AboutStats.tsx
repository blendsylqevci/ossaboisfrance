"use client";

import React, { useState, useEffect } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const end = target;
    const duration = 1200; // 1.2 seconds
    const steps = 40;
    const stepValue = end / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(stepValue * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  if (!mounted) {
    return <>{target}{suffix}</>;
  }

  return <>{count}{suffix}</>;
}

export function AboutStats({ dict }: { dict: { experience: string; projects: string; quality: string } }) {
  return (
    <div className="about-stats-row">
      <div className="about-stat-item">
        <h3 className="stat-number">
          <AnimatedNumber target={30} suffix="+" />
        </h3>
        <p className="stat-label">{dict.experience}</p>
      </div>
      <div className="about-stat-item">
        <h3 className="stat-number">
          <AnimatedNumber target={700} suffix="+" />
        </h3>
        <p className="stat-label">{dict.projects}</p>
      </div>
      <div className="about-stat-item">
        <h3 className="stat-number">
          <AnimatedNumber target={100} suffix="%" />
        </h3>
        <p className="stat-label">{dict.quality}</p>
      </div>
    </div>
  );
}
