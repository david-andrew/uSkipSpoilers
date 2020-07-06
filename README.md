# uSkipSpoiler
A Chrome extension for seamlessly skipping spoilers in html5 videos

## How to Use
1. navigate to a video you want to apply spoilers to
2. determine the start and stop times for each instance of spoilers
3. click the uSkipSpoilers extension button
4. enter the timestamps for each spoiler instance
    - timestamps are in the form `[[HH:]mm:]ss[.ff]`. This means that seconds are required, and then minutes, hours, and fractions of seconds are optional.
    - some examples: 
        - `643` = 643 seconds, or 10 minutes 43 seconds
        - `05:24` = 5 minutes 24 seconds
        - `01:12:13.5` = 1 hour 12 minutes, 13.5 seconds
5. Either copy the url, or click "Go to URL" to navigate to your video with the spoiler filters applied

Opening a URL that contains spoiler timestamps will also allow you to edit the timestamps in the extension


## Bugs to fix
- closing the popup unloads any times that were entered. These should be saved unless you reload the page
- layout of elements in the popup is wonky. Everything should be converted to display: inline-block, or perhaps flexbox

## Attribution
Built from https://github.com/martellaj/chrome-extension-react-typescript-boilerplate
