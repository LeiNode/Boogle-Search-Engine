import React, { useEffect, useState } from "react";

function KWICIndex() {
    const [kwicData, setKwicData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch KWIC index from backend
    const fetchKwicIndex = async (pageNum) => {
        try {
            const response = await fetch("http://localhost:5000/api/kwicIndex");
            const data = await response.json();

            // Pagination logic
            const pageSize = 10;
            const pages = Math.max(1, Math.ceil(data.length / pageSize));
            setTotalPages(pages);

            const start = (pageNum - 1) * pageSize;
            const end = start + pageSize;

            setKwicData(data.slice(start, end));
        } catch (error) {
            console.error("Error fetching KWIC index:", error);
        }
    };

    useEffect(() => {
        fetchKwicIndex(page);
    }, [page]);

    const nextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h2>KWIC Index</h2>

                <table style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
                    <tbody>
                        {kwicData.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: "12px", fontWeight: "bold" }}>
                                    {item.shift}
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <a
                                        href={
                                            item.url.startsWith("http://") ||
                                            item.url.startsWith("https://")
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

                {kwicData.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                        <button onClick={prevPage} disabled={page === 1}>
                            ◀ Previous
                        </button>

                        <span style={{ margin: "0 15px" }}>
                            Page {page} of {totalPages}
                        </span>

                        <button onClick={nextPage} disabled={page === totalPages}>
                            Next ▶
                        </button>
                    </div>
                )}
            </header>
        </div>
    );
}

export default KWICIndex;
