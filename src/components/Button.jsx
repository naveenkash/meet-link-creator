import React from 'react';
import './Button.css';
import '../global.css';

function Button({ load, text }) {
  return (
    <button className="btn">
      {load ? (
        <div className="lds-ring center">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        text
      )}
    </button>
  );
}

export default Button;
