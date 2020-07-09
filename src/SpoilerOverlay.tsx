import React from "react";

export function SpoilerOverlay(id: string, display: 'block' | 'none' = 'block', description?: string): JSX.Element {
    
    const overlay = (
        <div id={id} style={{width: '100%', height: '100%', backgroundColor: 'black', pointerEvents: 'none', display: display}}>
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '75%'}}>
                <div style={{color: 'white', fontSize: '1000%', textAlign: 'center'}}>
                    SPOILERS
                </div>
                <div id={`${id}Description`} style={{color: 'white', fontSize: '500%', textAlign: 'center'}}>
                    {description ?? '(No Description)'}
                </div>
            </div>
        </div>
    );
    return overlay;
}