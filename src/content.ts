import { SpoilerRow, parseUrlParams } from './utils';


const rows: SpoilerRow[] = parseUrlParams(location.href);
console.log("WOULD BLOCK THE FOLLOWING:")
console.log(rows)


// const video = document.getElementById('html5-video-player')
// console.log('this is my content script');