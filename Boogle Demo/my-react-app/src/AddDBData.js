import logo from './boogle-logo.png';
import React, { useState, useRef } from 'react';

function AddDBData() {
    const [inputData, setInputData] = useState('');
    const [submitResponse, setSubmitResponse] = useState('');
    const inputRef = useRef(null);

    
    const insertNewLine = () => {
        if (inputData.includes('/n')) return; 

        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;

        const newValue = inputData.substring(0, start) + " /n " + inputData.substring(end);
        setInputData(newValue);

        setTimeout(() => {
            input.selectionStart = input.selectionEnd = start + 4;
        }, 0);
    };

    // \n if user presses enter or tab
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insertNewLine();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const parts = inputData.split('/n');
        if (parts.length !== 2) {
            setSubmitResponse("Error: Input must be in format URL /n descriptor");
            return;
        }

        const url = parts[0].trim();
        const descriptor = parts[1].trim();

        try {
            const response = await fetch('http://localhost:5000/api/addEntry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, descriptor }),
            });

            const data = await response.json();
            setSubmitResponse(data.message);
        } catch (error) {
            setSubmitResponse("Error: Input must be in format URL /n descriptor");
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={handleSubmit} className="inline">
                    <img src={logo} height={55} alt="Boogle Logo"
                        style={{ marginRight: '20px' }} />

                    <input
                        type="text"
                        ref={inputRef}
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter: URL /n descriptor"
                        style={{
                            paddingLeft: '24px',
                            marginRight: '5px',
                            width: '700px',
                            height: '50px',
                            borderRadius: '32px'
                        }}
                    />

                    <input type="submit" value="Add" style={{ width: '70px' }} />
                </form>

                {submitResponse && (
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {submitResponse}
                    </p>
                )}
            </header>
        </div>
    );
}

export default AddDBData;
