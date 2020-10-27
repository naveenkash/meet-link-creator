import React, { useEffect, useState } from 'react';
import './auth.css';
import '../../global.css';
import Button from '../../components/Button';

const runtime = chrome.runtime,
  storage = chrome.storage;

function login(setSubmitLoad) {
  setSubmitLoad(true);
  runtime.sendMessage({ message: 'login' }, function (res) {
    setSubmitLoad(false);
    window.close();
    if (runtime.lastError) {
      alert('Error occurred signing in. Try Again!');
    } else {
      if (res.name) {
      } else if (res.ok === false) {
        alert(res.message);
      }
    }
    return true;
  });
}

function Popup() {
  const [useLoad, setLoad] = useState(true);
  const [useSubmitLoad, setSubmitLoad] = useState(false);

  useEffect(() => {
    storage.local.get('user', function () {
      setLoad(false);
      if (runtime.lastError) {
        alert('Error occurred loading the data');
      }
    });
  });

  return !useLoad ? (
    <div className="App">
      <div className="auth-header color">
        <h2>Sign in to create meet video link</h2>
      </div>
      <div
        className="btn-wrapper"
        onClick={() => {
          login(setSubmitLoad);
        }}
      >
        <Button load={useSubmitLoad} text={'Sign in'} />
      </div>
    </div>
  ) : null;
}

export default Popup;
