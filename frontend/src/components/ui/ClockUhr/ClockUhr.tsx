"use client";
import React, { useState, useEffect } from "react";
import styles from "./ClockUhr.module.scss";

interface InputProps {
  data: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ClockUhr: React.FC<InputProps> = ({ value, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const [hour, setHour] = useState<string>(
    value?.split(":").map(Number)[0].toString()
  );
  const [time, setTime] = useState<string>(value || "");

  const getClosestMinute = (min: number) => {
    return minutes.reduce((prev, curr) =>
      Math.abs(curr - min) < Math.abs(prev - min) ? curr : prev
    );
  };
  const [minute, setMinute] = useState<string>(() => {
    const minValue = value ? Number(value.split(":")[1]) : 0;
    return getClosestMinute(minValue).toString();
  });
  useEffect(() => {
    console.log("==value ClockUhr==", value);
    setTime(value);
    setHour(value?.split(":").map(Number)[0].toString());
    setMinute(() => {
      const minValue = value ? Number(value.split(":")[1]) : 0;
      return getClosestMinute(minValue).toString();
    });
  }, [value]);
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    return { x, y };
  };

  const handleTimeClick = (hour: number, minute: number) => {
    const newtime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}
      `;
    const syntheticEvent = {
      target: { value: newtime },
    } as React.ChangeEvent<HTMLInputElement>;
    setHour(hour.toString());
    setMinute(minute.toString());
    setTime(newtime);
    onChange(syntheticEvent);
  };

  return (
    <div className={styles["timeUhr"]}>
      <div className={styles["clock-picker"]}>
        <div className={styles["clock-face"]}>
          <div className={styles["clock-face-display"]}>
            <div
              className={`${styles["time-display"]} ${styles["time-display-hour"]}`}
            >
              {time
                ? time.split(":").map(Number)[0].toString().padStart(2, "0")
                : [0, 0]}
            </div>
            <span>:</span>
            <div className={`${styles["time-display"]} }`}>
              {time
                ? time.split(":").map(Number)[1].toString().padStart(2, "0")
                : [0, 0]}
            </div>
          </div>
          {hours.map((h) => {
            const { x, y } = getPosition(h, 24, 80);
            return (
              <div
                key={h}
                className={`${styles.hour} ${
                  h.toString().padStart(2, "0") ===
                  hour.toString().padStart(2, "0")
                    ? styles.selected
                    : ""
                }`}
                style={{
                  left: `calc(50% + ${Math.round(x * 1.4)}px)`,
                  top: `calc(50% + ${Math.round(y * 1.4)}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => handleTimeClick(h, minute)}
              >
                {h}
              </div>
            );
          })}
        </div>
        <div className={styles["minutes-face"]}>
          <div className={styles["clock-face-display"]}>
            <div className={`${styles["time-display"]} `}>
              {time
                ? String(time.split(":").map(Number)[0]).padStart(2, "0")
                : [0, 0]}
            </div>
            <span>:</span>
            <div
              className={`${styles["time-display"]} ${styles["time-display-hour"]}`}
            >
              {time
                ? String(time.split(":").map(Number)[1]).padStart(2, "0")
                : [0, 0]}
            </div>
          </div>
          {minutes.map((m) => {
            const { x, y } = getPosition(m / 5, 12, 80);
            return (
              <div
                key={m}
                className={`${styles.minute} ${
                  m.toString().padStart(2, "0") ===
                  minute.toString().padStart(2, "0")
                    ? styles.selected
                    : ""
                }`}
                style={{
                  left: `calc(50% + ${Math.round(x)}px)`,
                  top: `calc(50% + ${Math.round(y)}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => handleTimeClick(hour, m)}
              >
                {m}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClockUhr;
