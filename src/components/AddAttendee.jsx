import React, { useEffect, useState } from 'react';
import './Modal.css';
import Button from '../components/Button';
function AddAttendee(props) {
  const [currentAttendee, setCurrentAttendee] = useState('');
  const [useAttendees, setAttendees] = useState([]);
  let keysPressed = {};

  const create = () => {
    props.attendees(useAttendees);
  };

  const keyDownHandler = (event) => {
    keysPressed[event.key] = true;
    // create meeting after key combination is pressed
    if (keysPressed['Alt'] && event.key == 'w') {
      create();
    }

    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      event.preventDefault();
      event.stopPropagation();
      addNewAttendee();
    }
  };

  const keyUpHandler = (event) => {
    delete keysPressed[event.key];
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  });

  const addNewAttendee = () => {
    if (currentAttendee === '') {
      alert('Email cannot be empty');
      return;
    }
    setAttendees([...useAttendees, { email: currentAttendee }]);
    setCurrentAttendee('');
  };

  const updateAttendee = (value, index) => {
    let att = [...useAttendees];
    att[index].email = value;
    setAttendees(att);
  };

  const removeAttendee = (index) => {
    let att = [...useAttendees];
    let filtered = att.filter((_, idx) => index !== idx);
    setAttendees(filtered);
  };

  const createManually = () => {
    create();
  };

  return (
    <div className="meet-modal-wrapper modal-center">
      <div className="meet-modal">
        <div className="meet-attendee">
          <h3 id="modal-head">Add Attendees</h3>
          <p>
            Press (Alt + w) to create meet link, Press (Alt + a) to close modal
          </p>
          <div className="attendee">
            <input
              value={currentAttendee}
              placeholder="Attendee email"
              onChange={(e) => setCurrentAttendee(e.target.value)}
            />
            <button className="attendee-btn" onClick={addNewAttendee}>
              Add
            </button>
          </div>
          <div>
            {useAttendees.map((item, index) => (
              <div key={index} className="attendee">
                <input
                  className="attendee-update"
                  type="text"
                  value={item.email}
                  onChange={(e) => {
                    updateAttendee(e.target.value, index);
                  }}
                />
                <button
                  className="attendee-btn"
                  onClick={() => {
                    removeAttendee(index);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="create-meet-wrapper">
          <div className="create-meet" onClick={createManually}>
            <Button load={props.creatingEvent} text={'Create'} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAttendee;
