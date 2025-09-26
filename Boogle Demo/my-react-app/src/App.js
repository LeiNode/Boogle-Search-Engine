/* import logo from './logo.svg'; */
import logo from './boogle-logo.png';
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [inputData, setInputData] = useState('');
  const [submitResponse, setSubmitResponse] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetch('http://localhost:5000/api/data') // Replace with your backend URL and port
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior (page reload)
    /* const query = document.getElementById('Search').value.trim();
    const messageDiv = document.querySelector('.results');
    messageDiv.innerHTML = `${query}`; */
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
  
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        <p>Message from backend: {message}</p>
        <form onSubmit={handleSubmit} className="inline">
          <img src={logo} height={55} alt="Boogle Logo" style={{ marginRight: '20px'}}/>
          <input type="text" id="Search" value={inputData} onChange={(e) => setInputData(e.target.value)} placeholder="Search..." style={{ paddingLeft: '24px', marginRight: '5px', width: '700px', height: '50px', borderRadius: '32px'}}/>
          <input type="submit" value="Search"></input>
        </form>
        {submitResponse && <p>{submitResponse}</p>}
        <div className="results"></div>
      </header>
    </div>
  );
}

export default App;
