import React,{useState} from "react";
import './textbox.css'

const InputBox = ({ value, onChange, placeholder, style }) => {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-input"
        style={style}
      />
    );
  };

  export default InputBox;