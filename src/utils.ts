import { uuid } from 'uuidv4'

//represent the times of spoilers to block
export interface SpoilerRow {
    startText: string;
    stopText: string;
    id: string; //necessary so that the id's of the list elements don't change when you delete rows
}

//regex defining the format of timestamps stored as url parameters. timestamps are of the format [[hh:]mm:]ss[.ff]
export const paramRegEx: RegExp = /(((\d+):)?(\d+):)?(\d+)(\.(\d+))?/;

const pow = Math.pow;
const ceil = Math.ceil;
const log10 = Math.log10;
export const paramToSeconds = (param: string): number => {
    const match = param.match(paramRegEx);

    const HH: number = +(match?.[3] ?? '0');
    const mm: number = +(match?.[4] ?? '0');
    const ss: number = +(match?.[5] ?? '0');     //this should never be undefined
    const ff: number = +(match?.[7] ?? '0');

    const seconds: number = HH*3600 + mm*60 + ss + ff / pow(10, ceil(log10(ff + 1)));

    return seconds;
}


//extract the rows data structure from the given url
export const parseUrlParams = (url: string) => {
    if (url) {    
        //convert the URL to an object, and extract the spoilerStarts and spoilerStops parameters
        const urlObj = new URL(url)
        const spoilerStarts = urlObj.searchParams.get('spoilerStarts')?.split(',') ?? ''
        const spoilerStops = urlObj.searchParams.get('spoilerStops')?.split(',') ?? ''
        
        const maxLength = Math.max(spoilerStarts.length, spoilerStops.length) //handle cases where the url doesn't have an equal number of start and stop

        const indices = Array.from(Array(maxLength).keys());
        const rows: SpoilerRow[] = indices
            .map((i: number) => {
                const start: string | undefined = spoilerStarts[i];
                const stop: string | undefined = spoilerStops[i];
                return {
                    startText: start ?? '',
                    stopText: stop ?? '',
                    id: uuid()
                }
            })
            .filter((row: SpoilerRow) => row.startText || row.stopText); //filter out any elements that both have nothing in them

        return rows; //return the parsed rows
    } else {
        return [];   //for empty url, use an empty array 
    }
}


//update the url to contain the current parameters store in the rows data structure
export const updateUrlParams = (url: string, rows: SpoilerRow[]) => {

    if (url) {
        //construct the parameters to insert into the url
        const spoilerStarts: string = rows.map(row => row.startText).join(',');
        const spoilerStops: string = rows.map(row => row.stopText).join(',');

        const urlObj = new URL(url);
        urlObj.searchParams.set('spoilerStarts', spoilerStarts);
        urlObj.searchParams.set('spoilerStops', spoilerStops);

        return urlObj.href;
    } else {
        return '';
    }
}