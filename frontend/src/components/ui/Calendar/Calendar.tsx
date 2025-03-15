"use client";
import React, { useState, useEffect } from "react";
import styles from "./Calendar.module.scss";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
interface CalendarProps {
  handleDateChange?: (date: Date) => void;
  resetTrigger?: number;
  setFinishDate?: (date: Date) => void;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

const weekdays: string[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const months: string[] = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const Calendar: React.FC<CalendarProps> = ({
  handleDateChange,
  setFinishDate,
  shouldReset,
  onResetComplete,
}) => {
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const validateAndSetDate = (date: Date) => {
    const now = new Date();
    const selected = new Date(date.setHours(0, 0, 0, 0));
    const today = new Date(now.setHours(0, 0, 0, 0));
    if (selected < today) {
      setSuccessMessage("Date must be in the future!");
      setOpenModalMessage(true);
      setSelectedDate(new Date());
      setTimeout(() => {
        setSuccessMessage("");
        setOpenModalMessage(false);
      }, 2000);
      if (handleDateChange) handleDateChange(new Date());
      if (setFinishDate) setFinishDate(new Date());
    } else {
      setSelectedDate(date);
      if (handleDateChange) handleDateChange(date);
      if (setFinishDate) setFinishDate(date);
    }
  };
  useEffect(() => {
    if (shouldReset) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentDate(today);
      if (setFinishDate) setFinishDate(today);
      if (onResetComplete) onResetComplete();
    }
  }, [shouldReset, setFinishDate, onResetComplete]);
  useEffect(() => {
    validateAndSetDate(selectedDate);
  }, [selectedDate, handleDateChange, setFinishDate]);
  // useEffect(() => {
  //   if (handleDateChange) handleDateChange(selectedDate);
  //   if (setFinishDate) setFinishDate(selectedDate);
  // }, [selectedDate, handleDateChange, setFinishDate]);

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];

    const firstDayOfMonth =
      startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (day) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const newDate = new Date(year, month, day);
      setSelectedDate(newDate);
      if (handleDateChange) handleDateChange(newDate);
    }
  };

  const handleMonthChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleYearChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <>
      <ModalMessage message={successMessage} open={openModalMessage} />
      {/* <h5>
        Current Date: {new Date(currentDate).toLocaleString().slice(0, 10)}
      </h5>
      <h5>
        Selected Date: {new Date(selectedDate).toLocaleString().slice(0, 10)}
      </h5> */}

      <div className={`${styles["calendar"]} ${styles["rel"]}`}>
        <div className={`${styles["calendar-header"]}`}>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["prev-year"]}`}
            onClick={() => handleYearChange(-1)}
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["prev-month"]}`}
            onClick={() => handleMonthChange(-1)}
          >
            &lt;
          </button>
          <span>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["next-month"]}`}
            onClick={() => handleMonthChange(1)}
          >
            &gt;
          </button>
          <button
            type="button"
            className={`${styles["arrow-btn"]} ${styles["next-year"]}`}
            onClick={() => handleYearChange(1)}
          >
            &gt;&gt;
          </button>
        </div>
        <div className={`${styles["calendar-grid"]}`}>
          {weekdays.map((day, index) => (
            <div key={index} className={`${styles["calendar-day"]}`}>
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`${styles["calendar-day"]} ${
                day === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth()
                  ? styles["selected"]
                  : ""
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Calendar;
