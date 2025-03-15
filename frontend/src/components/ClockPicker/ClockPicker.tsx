"use client";
import React, { useState } from "react";
import styles from "./ClockPicker.module.scss";

interface ClockPickerProps {
  onTimeChange: (time: string) => void; // Передаём время в формате "HH:mm"
}

const ClockPicker: React.FC<ClockPickerProps> = ({ onTimeChange }) => {
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<string>("00");

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    onTimeChange(`${hour.toString().padStart(2, "0")}:${selectedMinute}`);
  };

  const handleMinuteClick = (minute: string) => {
    setSelectedMinute(minute);
    onTimeChange(`${selectedHour.toString().padStart(2, "0")}:${minute}`);
  };

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className={styles["clock-picker"]}>
      <div className={styles["clock-face"]}>
        {hours.map((hour) => (
          <div
            key={hour}
            className={`${styles.hour} ${styles[`hand-${hour}`]} ${
              hour === selectedHour ? styles.selected : ""
            }`}
            data-hour={hour}
            onClick={() => handleHourClick(hour)}
          >
            {hour}
          </div>
        ))}
        <div className={styles["clock-center"]}></div>
      </div>
      <div className={styles["minutes-picker"]}>
        {minutes.map((minute) => (
          <button
            key={minute}
            className={`${styles["minute-option"]} ${
              minute === selectedMinute ? styles.selected : ""
            }`}
            data-minute={minute}
            onClick={() => handleMinuteClick(minute)}
          >
            {minute}
          </button>
        ))}
      </div>
      <div className={styles["time-display"]}>
        <span className={styles["selected-hour"]}>
          {selectedHour.toString().padStart(2, "0")}
        </span>
        :<span className={styles["selected-minute"]}>{selectedMinute}</span>
      </div>
    </div>
  );
};

export default ClockPicker;
