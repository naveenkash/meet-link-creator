import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';

let user_signin_in = false;

const storage = chrome.storage,
  identity = chrome.identity,
  runtime = chrome.runtime,
  browserAction = chrome.browserAction,
  commands = chrome.commands;

/**
 * Get initial auth state
 */
storage.local.get('auth', function (data) {
  if (!runtime.lastError) {
    user_signin_in = data.auth || false;
    if (user_signin_in) {
      changeAuthPopUpToSignedIn();
    }
  }
});

/**
 * Listen to events
 */
runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'login') {
    if (!user_signin_in) {
      handleAuthClick(sendResponse);
    }
  } else if (request.message === 'signout') {
    if (user_signin_in) {
      handleSignoutClick(sendResponse);
    }
  } else if (request.message === 'create') {
    createEventListner();
  } else if (request.message === 'close') {
    closeModalListner();
  }
  return true;
});

/**
 * Listen to keyboard events
 */
commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'create':
      createEventListner();
      break;
    case 'close':
      closeModalListner();
      break;
    default:
      break;
  }

  return true;
});

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(cb) {
  // Show account ui to user to select account to get access token
  identity.getAuthToken({ interactive: true }, async function (token) {
    let err = {
      message: 'Error Occurred',
      ok: false,
    };
    if (runtime.lastError) {
      err.message = runtime.lastError.message;
      cb(err);
    } else {
      if (!token) {
        cb(err);
        return;
      }
      try {
        // Get user info after access token is received
        const RESP = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo?alt=json',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
          }
        );
        const DATA = await RESP.json();

        let user = {
          name: DATA.name,
          family_name: DATA.family_name,
          given_name: DATA.given_name,
          picture: DATA.picture,
          sub: DATA.sub,
        };
        // Update auth state after user detail is fetched
        storage.local.set({ auth: true, user }, function () {
          if (!runtime.lastError) {
            user_signin_in = true;
          }
        });
        cb(DATA);
        changeAuthPopUpToSignedIn();
      } catch (error) {
        err.message = error.message;
        err.code = error.code;
        cb(err);
      }
    }
  });
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(cb) {
  let err = {
      message: 'Error Occurred',
      code: 500,
      ok: false,
    },
    response = { message: 'Signout success', ok: true };
  // Get access token of logged in user
  identity.getAuthToken({}, async function (token) {
    if (runtime.lastError) {
      err.message = runtime.lastError.message;
      cb(err);
    } else {
      try {
        if (token) {
          // Revoke current access token
          const URL = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
          await fetch(URL);

          // Remove token form storage after token is revoked
          identity.removeCachedAuthToken({ token: token }, function () {
            // Update auth state after token is remove from local storage
            storage.local.set({ auth: false }, function () {
              user_signin_in = false;
              cb(response);
              changeSignedinPopUpToAuth();
            });
          });
        } else {
          // If token is not present update the auth state
          storage.local.set({ auth: false }, function () {
            user_signin_in = false;
            cb(response);
            changeSignedinPopUpToAuth();
          });
        }
      } catch (error) {
        err.message = error.message;
        err.code = error.code;
        cb(err);
      }
    }
  });
}

function changeAuthPopUpToSignedIn() {
  browserAction.setPopup({ popup: './popup.html' });
}

function changeSignedinPopUpToAuth() {
  browserAction.setPopup({ popup: './auth.html' });
}

async function createEvent(attendees, token) {
  let endAt = 1000 * 60 * 10;
  var event = {
    summary: 'Video Conference',
    description: 'Event Created from Chrome Extension',
    start: {
      dateTime: new Date().toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(Date.now() + endAt).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(32).substr(2),
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    attendees: attendees || [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };
  try {
    const RESP = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events/?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );
    const DATA = await RESP.json();
    return DATA;
  } catch (error) {
    throw error;
  }
}

function createEventListner() {
  identity.getAuthToken({}, async function (token) {
    if (runtime.lastError) {
      alert(runtime.lastError.message);
    } else {
      if (token) {
        chrome.tabs.query({ active: true }, (tabs) => {
          let tabId = tabs[0].id;
          chrome.tabs.sendMessage(
            tabId,
            {
              message: 'openAttendeesModal',
            },
            async function (response) {
              if (runtime.lastError) {
                alert(runtime.lastError.message);
                return;
              }
              // Create google meet event after attendees are added
              try {
                const DATA = await createEvent(response, token);
                // Show meet info after meeting is created
                chrome.tabs.sendMessage(
                  tabId,
                  {
                    message: 'openMeetInfoModal',
                    hangoutLink: DATA.hangoutLink,
                  },
                  async function (response) {
                    if (runtime.lastError) {
                      alert(runtime.lastError.message, 'create');
                      return;
                    }
                  }
                );
              } catch (error) {
                alert(error.message);
              }
            }
          );
        });
      } else {
        alert('Please Login Before Creating Meeting');
        // Not logged in
      }
    }
  });
}

function closeModalListner() {
  chrome.tabs.query({ active: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: 'closeModal' });
  });
}
