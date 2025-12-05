import logo from './boogle-logo.png';
import './Home.css';
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';

function Home() {
    const [inputData, setInputData] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [clickCount, setClickCount] = useState({});
    const [selectValue, setSelectValue] = useState('optionA');

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

    const handleChange = (event) => {
        setSelectValue(event.target.value);
    };

    const handleClick = (url) => {
        setClickCount(prev => ({
            ...prev,
            [url]: (prev[url] || 0) + 1
        }));
    };

    const handleSubmit = async (event, newPage = 1) => {
        if (event) event.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: inputData, page: newPage }),
            });

            const data = await response.json();

            if (selectValue === 'optionA')
                setResults(data.results);
            else if (selectValue === 'optionB')
                setResults(data.results.slice().sort((a, b) => (clickCount[b.url] || 0) - (clickCount[a.url] || 0)));
            setTotalPages(data.totalPages);
            setTotalResults(data.totalResults);
            setPage(newPage);

        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const handleRemove = async (descriptor, url) => {
        try {
            const response = await fetch('http://localhost:5000/api/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor: descriptor, url: url }),
            });

            const data = await response.json();

            // Pagination logic
            const pageSize = 8;
            const pages = Math.max(1, Math.ceil(data.length / pageSize));
            setTotalResults(data.length)
            setTotalPages(pages);
            setResults(data);

        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const nextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedAutofillValue, setSelectedAutofillValue] = useState(null);

    useEffect(() => {
        if (!open) return;

        async function fetchOptions() {
            try {
                const response = await fetch("http://localhost:5000/api/getOptions");
                const data = await response.json();
                setOptions(data.options);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        }

        fetchOptions();
    }, [open]);

    function makeTable(results, currentPage) {
        if (!Array.isArray(results) || results.length === 0) {
            return <div>No results found.</div>;
        }

        const pageSize = 8;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = currentPage * pageSize;

        const currentItems = results.slice(startIndex, endIndex);

        return (
            <table style={{ borderRadius: '20px', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                <tbody>
                    {currentItems.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid transparent', padding: '12px', fontWeight: 'bold', textAlign: 'left', width: '275px' }}>
                                {item.shift}
                            </td>
                            <td style={{ border: '1px solid transparent', padding: '12px', textAlign: 'left' }}>
                                <a
                                    href={
                                        item.url.startsWith("http://") || item.url.startsWith("https://")
                                            ? item.url
                                            : "http://" + item.url
                                    }
                                    onClick={() => handleClick(item.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.url}
                                </a>
                            </td>
                            <td style={{ border: '1px solid transparent', width: '60px', padding: '12px', textAlign: 'right' }}>
                                {clickCount[item.url] !== 1 ? (
                                    <span>{clickCount[item.url] || 0} clicks</span>
                                ) : (
                                    <span>{clickCount[item.url] || 0} click</span>
                                )}
                            </td>
                            <td style={{ border: '1px solid transparent', padding: '12px', textAlign: 'left', maxWidth: '90px' }}>
                                <button onClick={() => handleRemove(item.shift, item.url)}>Remove</button>
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
                    {/* <input
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
                    <input type="submit" value="Search" /> */}
                    <Autocomplete
                        freeSolo
                        id="Search"
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        value={selectedAutofillValue}
                        onChange={(event, newValue) => {
                            setSelectedAutofillValue(newValue);
                        }}
                        inputValue={inputData}
                        onInputChange={(event, newInputValue) => {
                            setInputData(newInputValue);
                        }}
                        // placeholder="Search..."
                        options={options}
                        renderOption={(props, option) => (
                            <li {...props} style={{ padding: "18px 16px" }}>
                                {option}
                            </li>
                        )}
                        filterOptions={(opts) => {
                            if (!inputData) return [];
                            return opts.filter((item) =>
                                item.startsWith(inputData)
                            );
                        }}
                        sx={{
                            paddingLeft: '24px',
                            marginRight: '5px',
                            width: '700px',
                            height: '50px',
                            borderRadius: '32px',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderColor: 'lightcyan', // Border color on hover
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white', // Border color on focus
                                },
                            },
                        }}
                        renderInput={(params) => (
                            <TextField {...params}
                                label="Search..."
                                InputLabelProps={{
                                    style: { color: 'white' }, // change text color of label
                                }}
                                variant="outlined"
                                sx={{
                                    '& .MuiInputBase-input': {
                                        color: 'white', // change input text color
                                    },
                                    '& .MuiAutocomplete-popupIndicator .MuiSvgIcon-root': {
                                        color: 'white', // change color of dropdown arrow
                                    },
                                    '& .MuiAutocomplete-clearIndicator': {
                                        color: 'white', // change color of 'X' symbol to clear text box
                                    },
                                }}
                            />
                        )}
                    />
                    <Button type="submit" variant="contained">Search</Button>
                </form>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h6 style={{ display: 'flex', justifyContent: 'center', marginRight: '10px' }}>Sort By:</h6>
                    <select value={selectValue} onChange={handleChange} style={{ width: '190px', height: '25px', marginTop: '3px' }}>
                        <option value="optionA">Alphabetical Order</option>
                        <option value="optionB">Most Frequently Accessed</option>
                    </select>
                </div>
                <p style={{ boxShadow: '4px 4px 6px #818589', backgroundColor: '#0F52BA', color: 'white', padding: '2px 20px', fontSize: '16px', marginTop: '-8px', marginBottom: '30px', height: '25px' }}>To use "OR/AND/NOT" search, specify "OR", "AND", "NOT" in the search, e.g., <strong>Music OR service</strong>.</p>

                {results.length === 0 ? (
                    <h5>No results found.</h5>
                ) : (
                    <>
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
                    </>
                )}
            </header>
        </div>
    );
}

export default Home;
