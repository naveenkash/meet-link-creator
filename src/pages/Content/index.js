import AddAttendee from '../../components/AddAttendee';
import React from 'react';
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

  const { message } = request;

  switch (message) {
    case 'openAttendeesModal':
      // Open modal to add attendees
      if (!addAttendeeModalOpened) {
        showAddAttendeeModal(sendResponse);
      }
      addAttendeeModalOpened = true;
      break;
    case 'closeAttendeesModal':
      // Close add attendees modal
      let attendeeModal = document.querySelector('#meet-modal-container');
      if (attendeeModal) {
        addAttendeeModalOpened = false;
        closeModal(attendeeModal);
        response.message = 'Removed successfully';
        sendResponse(response);
      }
      break;
  }
  return true;
});

function showAddAttendeeModal(cb) {
  const modal = document.createElement('div');
  modal.setAttribute('id', 'meet-modal-container');
  modal.setAttribute('class', 'modal-center');
  render(
    <AddAttendee
      attendees={(data) => {
        addAttendees(data, cb);
      }}
    />,
    document.body.appendChild(modal)
  );
}

function addAttendees(data, cb) {
  cb(data);
}

function closeModal(modal) {
  unmountComponentAtNode(modal);
  document.body.removeChild(modal);
}
