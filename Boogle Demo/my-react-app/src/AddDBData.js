import logo from './boogle-logo.png';
import React, { useEffect, useState, useRef } from 'react';

function AddDBData() {
    const [inputData, setInputData] = useState('');
    const [submitResponse, setSubmitResponse] = useState('');
    const inputRef = useRef(null);
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [statusCode, setStatusCode] = useState(400);

    const fetchInitialIndex = async (pageNum) => {
        try {
            const response = await fetch('http://localhost:5000/api/loadSearch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: inputData }),
            });
            const data = await response.json();

            // Pagination logic
            const pageSize = 8;
            const pages = Math.max(1, Math.ceil(data.length / pageSize));
            setTotalResults(data.length)
            setTotalPages(pages);
            setResults(data);
        } catch (error) {
            console.error("Error fetching KWIC index:", error);
        }
    };

    useEffect(() => {
        fetchInitialIndex(page);
    }, []);

    const nextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    function makeTable(results, currentPage) {
        if (!Array.isArray(results) || results.length === 0) {
            return <div>No results found.</div>;
        }

        const pageSize = 8;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = currentPage * pageSize;

        const currentItems = results.slice(startIndex, endIndex);

        return (
            <table style={{ borderRadius: '20px', fontSize: '16px', whiteSpace: 'pre-wrap', marginTop: '12px' }}>
                <tbody>
                    <tr><td colSpan={2} style={{ backgroundColor: '#0F52BA', fontWeight: 'bold', fontSize: '18px', height: '40px' }}>Current Entries</td></tr>
                    <tr style={{ height: '0px' }}><td>&nbsp;</td></tr>
                    {currentItems.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'left', width: '275px' }}>
                                {item.shift}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'left' }}>
                                <a
                                    href={
                                        item.url.startsWith("http://") || item.url.startsWith("https://")
                                            ? item.url
                                            : "http://" + item.url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.url}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    
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
            setStatusCode(400);
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
            setStatusCode(response.status);
        } catch (error) {
            setSubmitResponse("Error: Input must be in format URL /n descriptor");
            setStatusCode(400);
        }

        fetchInitialIndex(page);
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

                    <input type="submit" value="Add" style={{ width: '70px', borderWidth: '0px', borderRadius: '30px', color: 'white', backgroundColor: '#0F52BA' }} />
                </form>

                {submitResponse ? (
                    statusCode === 400 ? (
                        <p style={{ marginTop: '40px', whiteSpace: 'pre-wrap', color: '#ff3333' }}>
                            {submitResponse}
                        </p>
                    ) : (
                        <p style={{ marginTop: '40px', whiteSpace: 'pre-wrap', color: '#7CFC00' }}>
                            {submitResponse}
                        </p>
                    )
                ) : (
                    <p style={{ marginTop: '40px', whiteSpace: 'pre-wrap' }}>&nbsp;</p>
                )}
                {makeTable(results, page)}
                <h6 style={{ marginTop: '40px', fontSize: '18px' }}>
                    Page {page} of {totalPages} — {totalResults} results
                </h6>

                <div style={{ marginTop: '-30px' }}>
                    <button onClick={prevPage} disabled={page === 1} style={{ marginLeft: '190px', width: '90px' }}>
                        ◀ Previous
                    </button>

                    <button onClick={nextPage} disabled={page === totalPages} style={{ marginLeft: '80px', width: '90px' }}>
                        Next ▶
                    </button>
                </div>
            </header>
        </div>
    );
}

export default AddDBData;
