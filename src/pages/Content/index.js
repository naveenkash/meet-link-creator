import AddAttendee from '../../components/AddAttendee';
import MeetVideoInfo from '../../components/MeetVideoInfo';
import React, { useState } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

const runtime = chrome.runtime;
let addAttendeeModalOpened = false;

runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let response = {
    message: 'Created successfully',
    ok: true,
  };
  if (runtime.lastError) {
    alert(runtime.lastError.message);
    return;
  }

  const { message, hangoutLink } = request;
  switch (message) {
    case 'openAttendeesModal':
      // Open modal to add attendees
      if (!addAttendeeModalOpened) {
        showAddAttendeeModal(sendResponse);
      }
      addAttendeeModalOpened = true;
      break;
    case 'closeModal':
      // Close add attendees modal
      let attendeeModal = document.querySelector('#meet-modal-container');
      if (attendeeModal) {
        addAttendeeModalOpened = false;
        closeModal(attendeeModal);
        response.message = 'Removed successfully';
        sendResponse(response);
      }
      break;
    case 'openMeetInfoModal':
      let InfoModal = document.querySelector('#meet-modal-container');
      // Open meet info modal to show info
      addAttendeeModalOpened = false;
      closeModal(InfoModal);
      showMeetInfoModal(hangoutLink, sendResponse);
    default:
      break;
  }
  return true;
});

function showAddAttendeeModal(cb) {
  const AddAttendeeWrapper = () => {
    let [creatingEvent, setCreatingEvent] = useState(false);
    return (
      <AddAttendee
        attendees={(data) => {
          setCreatingEvent(true);
          addAttendees(data, cb);
        }}
        creatingEvent={creatingEvent}
      />
    );
  };
  const modal = document.createElement('div');
  modal.setAttribute('id', 'meet-modal-container');
  modal.setAttribute('class', 'modal-center');
  render(<AddAttendeeWrapper />, document.body.appendChild(modal));
}

function addAttendees(data, cb) {
  cb(data);
}

function closeModal(modal) {
  unmountComponentAtNode(modal);
  document.body.removeChild(modal);
}

function showMeetInfoModal(data, cb) {
  const modal = document.createElement('div');
  modal.setAttribute('id', 'meet-modal-container');
  modal.setAttribute('class', 'modal-center');
  render(
    <MeetVideoInfo hangoutLink={data} />,
    document.body.appendChild(modal)
  );
}
