import React, { useEffect, useState } from "react";
import useClippy from 'use-clippy';
import { SpoilerRow, parseUrlParams, updateUrlParams, paramRegEx } from '../utils'
import { uuid } from 'uuidv4'


export default function Popup() {
  
    //data to be used by the popup
    const [url, setUrl] = useState<string>('');            //local copy of the current url
    const [rows, setRows] = useState<SpoilerRow[]>([]);    //data structure storing the start/stop times of each spoiler
    const [clipboard, setClipboard] = useClippy();         //allow us to set the user's clipboard when they copy the url


    //on app initialization, set the initial url, and the value of rows if any already exist
    useEffect(() => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {               
            const tab = tabs[0]
            const initialUrl = tab.url;
            const initialRows: SpoilerRow[] = parseUrlParams(initialUrl);
            setUrl(initialUrl);
            setRows(initialRows);
        });
    }, [])


    //anytime rows change, update the saved url to contain the new parameters
    useEffect(() => {
        const newUrl = updateUrlParams(url, rows)
        setUrl(newUrl);
    }, [rows])


    //function to call anytime the user updates the text for a spoiler row start time
    const onSpoilerRowStartChange = (event, changedIdx: number) => {
        console.log(`changed start to ${event.target.value}`)
        setRows(rows.map((row: SpoilerRow, i: number) => {
            if (i !== changedIdx) {
                return row;
            } else {
                return {...row, startText: event.target.value}
            }
        }));
    };


    //function to call anytime the user updates the text for a spoiler row stop time
    const onSpoilerRowStopChange = (event, changedIdx: number) => {
        console.log(`changed stop to ${event.target.value}`)
        setRows(rows.map((row: SpoilerRow, i: number) => {
            if (i !== changedIdx) {
                return row;
            } else {
                return {...row, stopText: event.target.value}
            }
        }));
    };
  

    //insert a new empty spoiler row
    const onAddNewSpoiler = () => {
        setRows([...rows, {startText: '', stopText: '', id: uuid()}]) //add a new blank row to the list of rows
    }


    //remove the spoiler row for the selected spoiler
    const onRemoveSpoiler = (removeIdx: number) => {
        setRows([...rows.filter((row: SpoilerRow, i: number) => i !== removeIdx)])
    }


    //make the browser navigate to the constructed url
    const onNavigateToUrl = () => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            const tab = tabs[0];
            chrome.tabs.update(tab.id, {url: url})
        })
    }

    //validate the data the user has entered
    const validRows: boolean[][] = rows.map((row: SpoilerRow) => {
        return [!paramRegEx.test(row.startText), !paramRegEx.test(row.stopText)];
    });

    //if any fields invalid, then disable the copy and navigate buttons. Also disable buttons if no rows exist
    const anyInvalid = validRows.reduce((prevValid: boolean, validRow: boolean[]) => prevValid || validRow[0] || validRow[1], false);
    const disableButtons = anyInvalid || rows.length === 0;

    //CSS to display an invalid row
    const errorStyle: React.CSSProperties = {
        border: '1px solid red'
    }

    //create the component for the popup
    return (
        <div style={{width:'30em'}}>
            <div style={{padding:'10px'}}>
                <div style={{marginBottom:'10px'}}>
                    <h1>uSkip Spoilers</h1>
                    <form>
                        <ul>
                            {rows.map((row: SpoilerRow, i: number) => {
                                const startError = validRows[i][0];
                                const stopError = validRows[i][1];
                                return (
                                    <div key={`spoiler${row.id}`}>
                                        <div style={{margin:'5px'}}>
                                            <label style={{padding:'5px'}}>Start</label>
                                            <input style={startError ? errorStyle : {}} type='text' placeholder='[HH:mm:]ss[.fff]' value={row.startText} onChange={(event) => onSpoilerRowStartChange(event, i)} />
                                        </div>
                                        <div style={{margin:'5px'}}>
                                            <label style={{padding:'5px'}}>Stop</label>
                                            <input style={stopError ? errorStyle : {}} type='text' placeholder='[HH:mm:]ss[.fff]' value={row.stopText} onChange={(event) => onSpoilerRowStopChange(event, i)} />
                                        </div>
                                        <button onClick={() => onRemoveSpoiler(i)}>remove</button>
                                        <hr/>
                                    </div>
                                );
                            })}
                        </ul>
                    </form>
                    <button onClick={onAddNewSpoiler}>Add new spoiler</button>
                </div>
                <div style={{padding: '10px'}}>
                    <label style={{padding: '5px'}}>URL</label>
                    <input readOnly type='text' value={url}/>
                    <button disabled={disableButtons} onClick={() => setClipboard(url)}>copy</button>
                </div>
                <div style={{padding: '10px'}}>
                    <button disabled={disableButtons} style={{width:'100%'}} onClick={onNavigateToUrl}>Go to URL</button>
                </div>
            </div>
        </div>
    );
}
