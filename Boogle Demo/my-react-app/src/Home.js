/* import logo from './logo.svg'; */
import logo from './boogle-logo.png';
import './Home.css';
import React, { useState } from 'react';

function Home() {
    const [inputData, setInputData] = useState('');
    const [submitResponse, setSubmitResponse] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevents the default form submission behavior (page reload)
        try {
            const response = await fetch('http://localhost:5000/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ myInput: inputData }),
            });
            const data = await response.json();
            setSubmitResponse(data.message);
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    function makeTable(data) {
        let dbData = data.split("Alphabetized Lines:\n");
        const tableData = [
            { id: "Circular Shifted Lines", description: dbData[0] },
            { id: "Alphabetized Lines", description: dbData[1] }
        ];
        return (
            <table style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                <tbody>
                    {tableData.map((item) => (
                        <tr key={item.id}>
                            <th scope="row" style={{ border: '2px solid white', padding: '24px' }}>{item.id}</th>
                            <td style={{ border: '2px solid white', padding: '24px', textAlign: 'left' }}>{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={handleSubmit} className="inline">
                    <img src={logo} height={55} alt="Boogle Logo" style={{ marginRight: '20px' }} />
                    <input type="text" id="Search" name="Home_Page_Form" value={inputData} onChange={(e) => setInputData(e.target.value)} placeholder="Search..." style={{ paddingLeft: '24px', marginRight: '5px', width: '700px', height: '50px', borderRadius: '32px' }} />
                    <input type="submit" name="submit_Home_Form" value="Search"></input>
                </form>
                {submitResponse && <div><br></br>{makeTable(submitResponse)}</div>}
                <div className="results"></div>
            </header>
        </div>
    );
}

export default Home;