"use client";
import React, { RefObject } from "react";
import styles from "./Input.module.scss";

interface InputProps {
  typeInput:
    | "text"
    | "textarea"
    | "number"
    | "datetime-local"
    | "email"
    | "tel"
    | "date"
    | "password"
    | "time";
  data: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

const Input: React.FC<InputProps> = ({
  typeInput,
  data,
  value,
  onChange,
  inputRef,
}) => {
  return (
    <div className={styles["input-field"]}>
      {typeInput === "textarea" ? (
        <textarea
          id={data}
          name={data}
          value={value}
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          onChange={onChange}
          required
        />
      ) : (
        <input
          id={data}
          ref={inputRef as RefObject<HTMLInputElement>}
          name={data}
          type={typeInput}
          value={value}
          onChange={(e) => {
            console.log("Input onChange:", e.target.value);
            onChange(e);
          }}
          required
        />
      )}
      <label htmlFor={data}>{data}</label>
    </div>
  );
};

export default Input;
