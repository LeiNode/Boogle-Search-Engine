1. Ensure boogle-demo-firebase-adminsdk-fbsvc-27fad66187.json is located in the "Flask Files" folder.

2. Update the home path in pyvenv.cfg.
     - Locate and open the pyvenv.cfg file. Can be found in Boogle Demo -> Flask Files -> venv.
     - Set the home path to the directory where the base Python executable (py.exe) used to create the virtual environment is located.

3. Get 'node_modules' folder.
     - In Visual Studio Code, open the Boogle-Search-Engine project folder.
     - Open a new terminal in Visual Studio Code and change directory to the "Flask Files" folder.
     - Activate a virtual environment by typing .\venv\Scripts\activate into the terminal. (should see a green 'venv' before the command line if activated)
     - With the virtual environment activated, change directory to the "my-react-app" folder in the terminal and then run "npm install".
     - Additionally, run "npm install @mui/material @emotion/react @emotion/styled" to install Material UI.

4. Run the main.py script.
     - Open a separate terminal in Visual Studio Code and change directory to the "Flask Files" folder.
     - Activate a virtual environment by typing .\venv\Scripts\activate into the terminal. (should see a green 'venv' before the command line if activated)
     - With the virtual environment activated, run python main.py.

5. Run the React app.
     - In the terminal from step 2 in Visual Studio Code, run npm start.