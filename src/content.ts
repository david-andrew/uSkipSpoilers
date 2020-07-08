import { SpoilerRow, parseUrlParams, paramToSeconds, SpoilerBounds, isInBounds } from './utils';


//collect the timestamp string of spoilers from the URL
const rows: SpoilerRow[] = parseUrlParams(location.href);


if (rows.length > 0) {

    //only run script if there are any block parameters are in the URL. if none, then skip everything
    console.log('Running uSkipSpoiler for this video');

    //boolean array to keep track of whether or not the i'th video has a spoiler overlay
    const spoilerOverlayStates: boolean[] = []

    //convert the URL timestamp strings to seconds
    const spoilersBounds: SpoilerBounds[] = rows.map((row: SpoilerRow) => {
        return {
            start: paramToSeconds(row.startText), 
            stop: paramToSeconds(row.stopText)
        }
    });

    //determine if the current time falls within any of the specified spoilers bounds
    const isTimeInSpoilers = (time: number): boolean => {
        return spoilersBounds.reduce((isSpoiler: boolean, bounds: SpoilerBounds) => isInBounds(bounds, time) || isSpoiler, false)
    }


    //collect all videos running on this page
    const videos: HTMLCollectionOf<HTMLVideoElement> = document.getElementsByTagName('video');

    const getOverlayElement = (id: string, display: 'block' | 'none' = 'block'): HTMLDivElement => {
        const spoilerOverlay = document.createElement('div');
        spoilerOverlay.id = id;

        //style properties for the div
        spoilerOverlay.style.width = '100%';               /* Full width (cover the whole page) */
        spoilerOverlay.style.height = '100%';              /* Full height (cover the whole page) */
        spoilerOverlay.style.backgroundColor = 'black';    /* Black background with opacity */
        // spoilerOverlay.style.zIndex = '2';                 /* Specify a stack order in case you're using a different order for other elements */
        spoilerOverlay.style.pointerEvents = 'none';       //the cursor cannot interact with the overlay
        spoilerOverlay.style.display = display;            //whether to show ('block') or not show ('none') the overlay. defaults to show
        
        //Add a div with the spoiler text in the center of the parent div
        const spoilerText = document.createElement('div');
        spoilerText.innerHTML = 'SPOILERS'
        spoilerText.style.color = 'white'
        spoilerText.style.fontSize = '1000%';
        spoilerText.style.textAlign = 'center';
        spoilerText.style.position = 'absolute';
        spoilerText.style.top = '50%';
        spoilerText.style.left = '50%';
        spoilerText.style.transform = 'translate(-50%, -50%)';

        //attach the text to the overlay div
        spoilerOverlay.appendChild(spoilerText);

        return spoilerOverlay
    }

    //handle actually applying the overlay the DOM
    const applyOverlay = (video: HTMLVideoElement, currentlySpoilers: boolean, i: number) => {
        const overlayElementId = `uSkipSpoilerOverlay${i}`;
        let spoilerOverlay = document.getElementById(overlayElementId);
        
        //this should never fire, but just in case... attach a new div to the video
        if (!spoilerOverlay) {
            spoilerOverlay = getOverlayElement(overlayElementId);
            video.parentElement.parentElement.prepend(spoilerOverlay);
        }
        
        if (currentlySpoilers) {
            console.log('Applying spoiler overlay to video');
            spoilerOverlay.style.display = 'block';
            video.muted = true;
            //TODO->mute sounds, etc.
        } else {
            console.log('Removing spoiler overlay from video');
            //TODO->unmute sounds, etc.
            spoilerOverlay.style.display = 'none';
            video.muted = false;
        }
    }

    //handle applying/removing the spoiler overlay on a video based on the current time
    const handleVideoTimeChanged = (i: number) => {
        const video: HTMLVideoElement = videos[i];
        const currentlySpoilers = isTimeInSpoilers(video.currentTime);

        //check if the currentlySpoilers doesn't match the overlay state, indicating the state just changed
        if (currentlySpoilers !== spoilerOverlayStates[i]) {
            applyOverlay(video, currentlySpoilers, i);
            spoilerOverlayStates[i] = currentlySpoilers;
        }
    }

    //create a callback for the i'th video that fires whenever it's currentTime attribute changes
    const createCallback = (i: number): (mutationList: MutationRecord[]) => void => {
        return (mutationList: MutationRecord[]) => {
            mutationList.forEach((mutation: MutationRecord) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'currentTime') {
                    handleVideoTimeChanged(i);
                }
            });
        };
    }



    
    for (let i = 0; i < videos.length; i++) {

        //add a boolean for this video's current state (i.e. whether we are displaying a spoiler overlay)
        spoilerOverlayStates.push(false);

        //add a hidden overlay to each element. set as invisible at start
        const overlayElementId = `uSkipSpoilerOverlay${i}`;
        const spoilerOverlay = getOverlayElement(overlayElementId, 'none');
        videos[i].parentElement.parentElement.prepend(spoilerOverlay);
        
    }

    //every 500 milliseconds, check the video time
    const refreshInterval = 250; //interval in milliseconds to recheck the video time
    window.setInterval(() => { for (let i = 0; i < videos.length; i++) { handleVideoTimeChanged(i) } }, refreshInterval);
}