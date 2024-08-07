import React from 'react';
import './Button.css'

const Button = ({ onClick, disabled, label }) => {
  return (
    <button className='button' onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
