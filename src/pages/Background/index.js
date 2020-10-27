import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';

let user_signin_in = false;

const storage = chrome.storage,
  identity = chrome.identity,
  runtime = chrome.runtime,
  browserAction = chrome.browserAction;

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
