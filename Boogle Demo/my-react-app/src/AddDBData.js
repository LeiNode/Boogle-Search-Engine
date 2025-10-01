import logo from './boogle-logo.png';
import React, { useState } from 'react';

function AddDBData() {
    const [inputData, setInputData] = useState('');
    const [submitResponse, setSubmitResponse] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevents the default form submission behavior (page reload)
        try {
            const response = await fetch('http://localhost:5000/api/submit2', {
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
        let dbData = data.split("DB Data:\n");
        const tableData = [
            { id: "Sentences in Database", description: dbData[1] }
        ];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {dbData[0]}<br></br>
                <table style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                    <tbody>
                        {tableData.map((item) => (
                            <tr key={item.id}>
                                <th scope="row" style={{ border: '2px solid white', padding: '18px' }}>{item.id}</th>
                                <td style={{ border: '2px solid white', padding: '18px', textAlign: 'left' }}>{item.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={handleSubmit} className="inline">
                    <img src={logo} height={55} alt="Boogle Logo" style={{ marginRight: '20px' }} />
                    <input type="text" id="Search" value={inputData} onChange={(e) => setInputData(e.target.value)} placeholder="Enter data to add..." style={{ paddingLeft: '24px', marginRight: '5px', width: '700px', height: '50px', borderRadius: '32px' }} />
                    <input type="submit" value="Add" style={{ width: '50px' }}></input>
                </form>
                {submitResponse && <p style={{ whiteSpace: 'pre-wrap' }}>{makeTable(submitResponse)}</p>}
                <div className="results"></div>
            </header>
        </div>
    );
}

export default AddDBData;