import React, { useEffect, useState } from 'react';
import './Popup.css';
import '../../global.css';
import Button from '../../components/Button';

const runtime = chrome.runtime,
  storage = chrome.storage;

function signout(setSignOutLoad) {
  setSignOutLoad(true);
  runtime.sendMessage({ message: 'signout' }, function (res) {
    setSignOutLoad(false);
    if (runtime.lastError) {
      alert('Error occurred signing out. Try Again!');
    } else {
      if (res.ok) {
        // Remove user from local storage after token is revoked
        storage.local.remove('user', function () {});
      } else {
        alert(res.message);
      }
    }
    window.close();
    return true;
  });
}

function Popup() {
  const [useName, setName] = useState('');
  const [usePicture, setPicture] = useState('');
  const [useSignOutLoad, setSignOutLoad] = useState(false);

  useEffect(() => {
    // Get user info from local storage
    storage.local.get('user', function (data) {
      let user = data.user;
      if (user) {
        setName(user.name);
        setPicture(user.picture);
      }
    });
  });

  return (
    <div className="App">
      <div className="detail">
        <div className="img">
          <img src={usePicture} alt="user picture" />
        </div>
        <div className="name color">
          <p>Hi {useName}</p>
        </div>
      </div>
      <div
        className="btn-wrapper"
        onClick={() => {
          signout(setSignOutLoad);
        }}
      >
        <Button load={useSignOutLoad} text={'Sign Out'} />
      </div>
    </div>
  );
}

export default Popup;
