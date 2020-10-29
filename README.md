# Chrome Extension For Creating Google Meet Video

## About

Sign in and create google meet video link from keyboard or by using mouse

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **10.13**.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Create chrome extension Key for using auth in extension 
5. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Pack extension`
   4. Select the project folder.
6. Now You will have `build.crx` and `build.pem` file in your project folder
7. Copy the private in `build.pem` and paste in `"key":private_key` in your `manifest.json`
8. Go  to `chrome://extensions/` and find your extesnion and copy `ID` this is your extension id
9. Now go to google developer console and and create a project and go to credential and create `OAuth client ID` select application type `chrome app` and paste your extension id in application id.
10. Now copy your `OAuth client ID` and paste it in `"client_id":client_id` in `manifest.json`
11. Now remove your extension from `chrome://extensions/`
12. Run `npm start`
13. Click on `Load Unpacked` in `chrome://extensions/` and select your build folder in your project
14. Now start using the extension

## Features

1. Use `Alt + s` to open modal to add attendees to meeting 
2. Press `enter` to add attendee without clicking `add` button in modal 
3. Use `Alt + a` to close modal
4. Use `Alt + w` to save attendees and create meeting
5. Use `Alt + q` to copy meeting link to your clipboard