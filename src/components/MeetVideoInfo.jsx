import React, { useEffect } from 'react';
import './Modal.css';

function MeetVideoInfo({ hangoutLink }) {
  let keysPressed = {};

  const keyDownHandler = (event) => {
    keysPressed[event.key] = true;
    if (keysPressed['Alt'] && event.key == 'q') {
      var tempInput = document.createElement('input');
      tempInput.value = hangoutLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }
  };

  const keyUpHandler = (event) => {
    delete keysPressed[event.key];
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => (
      window.removeEventListener('keydown', keyDownHandler),
      window.removeEventListener('keyup', keyUpHandler)
    );
  });

  return (
    <div className="meet-modal-wrapper modal-center">
      <div className="meet-modal">
        <div className="meet-info">
          <p>
            Press (Alt + q) to copy link to clipboard, Press (Alt + a) to close
            modal
          </p>
        </div>
        <div className="meet-link">
          <p>
            <a target="_blank" href={hangoutLink}>
              {hangoutLink}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MeetVideoInfo;
