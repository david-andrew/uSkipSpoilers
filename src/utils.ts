import { uuid } from 'uuidv4'

//represent the times of spoilers to block
export interface SpoilerRow {
    startText: string;
    stopText: string;
    id: string; //necessary so that the id's of the list elements don't change when you delete rows
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