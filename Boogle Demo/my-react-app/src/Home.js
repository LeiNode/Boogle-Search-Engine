import logo from './boogle-logo.png';
import './Home.css';
import React, { useState } from 'react';

function Home() {
    const [inputData, setInputData] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const handleSubmit = async (event, newPage = 1) => {
        if (event) event.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: inputData, page: newPage }),
            });

            const data = await response.json();

            setResults(data.results);
            setTotalPages(data.totalPages);
            setTotalResults(data.totalResults);
            setPage(newPage);

        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const nextPage = () => {
        if (page < totalPages) handleSubmit(null, page + 1);
    };

    const prevPage = () => {
        if (page > 1) handleSubmit(null, page - 1);
    };

    function makeTable(results) {
        if (!Array.isArray(results) || results.length === 0) {
            return <div>No results found.</div>;
        }

        return (
            <table style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                <tbody>
                    {results.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '2px solid white', padding: '18px', fontWeight: 'bold' }}>
                                {item.shift}
                            </td>
                            <td style={{ border: '2px solid white', padding: '18px' }}>
                                <a
                                    href={
                                        item.url.startsWith("http://") || item.url.startsWith("https://")
                                            ? item.url
                                            : "http://" + item.url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "white", textDecoration: "none" }}
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

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={(e) => handleSubmit(e, 1)} className="inline">
                    <img src={logo} height={55} alt="Boogle Logo" style={{ marginRight: '20px' }} />
                    <input
                        type="text"
                        id="Search"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder="Search..."
                        style={{
                            paddingLeft: '24px',
                            marginRight: '5px',
                            width: '700px',
                            height: '50px',
                            borderRadius: '32px'
                        }}
                    />
                    <input type="submit" value="Search" />
                </form>

                <br />

                {results.length > 0 && (
                    <>
                        {makeTable(results)}

                        <div style={{ marginTop: '20px', fontSize: '18px' }}>
                            Page {page} of {totalPages} — {totalResults} results
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <button onClick={prevPage} disabled={page === 1}>
                                ◀ Previous
                            </button>

                            <button onClick={nextPage} disabled={page === totalPages} style={{ marginLeft: '10px' }}>
                                Next ▶
                            </button>
                        </div>
                    </>
                )}
            </header>
        </div>
    );
}

export default Home;
