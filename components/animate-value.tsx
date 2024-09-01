"use client";
import React, { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

interface Props {
  value: string | number;
  duration?: number;
  formatAsNumber?: boolean;
}
const AnimatedValue = ({
  value,
  duration = 1000,
  formatAsNumber = false,
}: Props) => {
  const [result, setResult] = useState(0);

  useEffect(() => {
    const numberValue = parseFloat(`${value}`);
    const startTime = Date.now();
    const interval = 16;
    const totalSteps = duration / interval;
    const stepIncrement = numberValue / totalSteps;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setResult(Math.floor(progress * numberValue));

      if (progress < 1) {
        setTimeout(updateValue, interval);
      }
    };

    const timeoutId = setTimeout(updateValue, interval);

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, duration]);

  return <span>{formatAsNumber ? formatNumber(result) : result}</span>;
};

export default AnimatedValue;
