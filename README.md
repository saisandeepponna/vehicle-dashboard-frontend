# vehicle-dashboard-frontend
The frontend of the Vehicle Dashboard Interface is built with React, providing a dynamic UI that displays real-time data from a  serverless (API gateway, Lambda) cloud-hosted backend on AWS. Users can interact with elements like motor speed sliders and charging buttons, which update the backend and reflect changes instantly on the dashboard.


The frontend of the Vehicle Dashboard Interface is designed to visually represent various vehicle components, including the motor, battery, and other essential indicators, while allowing user interactions to modify backend values through a clean and intuitive interface.

Technologies Used:
React: The frontend of the application is built using React to create a dynamic and responsive user interface.
CSS / SCSS: Styling is achieved using CSS (or SCSS) to ensure a visually appealing and easy-to-navigate layout that mimics a vehicle dashboard.
Axios: Axios is used to make HTTP requests to the backend API, allowing the frontend to interact with the database in real-time and update the UI accordingly.
React Router: Navigation between different views (like the gear, motor, and battery pages) is handled with React Router, ensuring a smooth user experience.
UI Components:
Top Row Icons:

Parking Brake Indicator: Displays the status of the parking brake (active/inactive).
Check Engine Indicator: Indicates whether the engine needs attention or service.
Motor Status Indicator: Shows whether the motor is running at high speeds.
Battery Low Indicator: Signals when the battery percentage is low.
Gauges:

Power Gauge: A visual representation of the current power being consumed by the motor or being charged into the battery.
Motor RPM Gauge: Displays the motor's RPM, which varies based on user interaction with the motor speed setting slider.
Middle Row Components:

Gear Ratio: Displays the current gear ratio of the motor (this is read-only).
Battery Percentage: Indicates the remaining battery percentage (dynamically updated).
Battery Temperature: Shows the current battery temperature, which increases as the motor speed increases.
Motor RPM: Displays the RPM of the motor.
Motor Speed Setting: A slider that allows users to change the speed of the motor. The speed setting adjusts the RPM from 0 (off) to 4 (maximum speed).
Bottom Row Buttons:

Gear, Motor, Battery Temperature: These buttons provide an option to view additional details about the gear, motor, and battery temperature. These buttons are not functional in this challenge but are included to match the interface.
View Menu Button: Allows users to access different information views (also not functional for this challenge).
Charging Button: Initiates the charging process for the battery. It updates the charging state, and the battery percentage increases over time while the motor is disabled.
User Interaction:
Motor Speed Setting: The motor speed slider directly affects the motor's RPM. Moving the slider adjusts the RPM in real-time and updates the backend database accordingly.
Charging Button: Clicking the "Charging" button simulates connecting the battery to a charger. While the motor is disabled, the battery percentage increases. The charging state is updated in the backend when this button is pressed.
Real-Time Data Interaction:
The frontend interacts with a cloud-hosted backend, fetching live data for indicators, motor RPM, battery percentage, temperature, and power consumption.
User actions such as changing the motor speed or pressing the charging button trigger updates to the backend, ensuring that all data reflects real-time changes and that the frontend is always in sync with the database.
Deployment:
The application is hosted on a static URL (e.g., GitHub Pages, Vercel, or Netlify), ensuring that users can easily access the vehicle dashboard interface from anywhere.
Testing & Evaluation:
The frontend is designed for easy testing and evaluation, with the real-time data from the backend reflecting all user interactions. The application is structured to ensure that all indicators and gauges update dynamically based on the data stored in the database.

