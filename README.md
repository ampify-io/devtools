### Installation ###

1. Clone Ampify Devtools repository 
https://github.com/ampify-io/devtools

2. yarn install / npm install

3. install browser extension locally in developer mode"

  the extension files are located in projects/extension/dist

  A: Visit chrome://extensions (via omnibox or menu -> Tools -> Extensions).
  B: Enable Developer mode by ticking the checkbox in the upper-right corner.
  C: Click on the "Load unpacked extension..." button.
  D: Select the directory containing your unpacked extension.

  https://stackoverflow.com/questions/24577024/install-chrome-extension-not-in-the-store


### RUN Tools ###

1. yarn server-start / npm run server-start
2. yarn static-start / npm run server-start (in new terminal)

### Convert Page to AMP ###

1. open new browser tab in chrome
2. open Developer tools 
3. emulate iphone x
4. go to the desired page (for example http://example.com/)
5. click on the extension browser icon
6. a tab with the converted amp page will open (http://localhost:2310/latest.html#development=1)

   example video: [VIDEO HERE]

### Convert Javascript to AMP with aQuery ###

  - Video
  
  example video: [VIDEO HERE]

 - Initial setup: 

  1. copy the example.com boilerplate in sites/example.com
  2. change the folder name to your site
  3. update the "name" prop in package json (inside the folder you've created)
  4. update ampify.json file in the root folder, change the url in "dev/paths" array to match your folder name

- Develope

  1. open src/index.js in the folder you've created
  2. write aQuery code
  3. run yarn build (or npm build)
  4. build file is created at /dist folder
  5. click the extension button to generate the page with the aQuery code (see "Convert Page to AMP" section)

- Debug

[OMER PUT HERE prologue text - 
1. we are in beta.. 
2. contact us at support@ampify.io and our slack channel
3. If you get stuck with an error from aQuery you can help us improving and debug aQuery code
]

 1. aQuery soure code is located at projects/aQuery
 2. extension code is located at projects/extension