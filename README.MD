# Kids Development Dashboard

A lightweight dashboard for tracking children's development milestones and achievements.
Use at: https://auders0n.github.io/site2timeline/

## Features

- Timeline view of kids' development
- Birthday tracking with age indicators
- Achievement management with icons
- Kid profile management
- Year-based filtering
- Responsive design optimized for Firefox

## Project Structure

```
├── css/
│   └── styles.css          # Global styles
├── js/
│   ├── data.js            # Data management layer
│   ├── timeline.js        # Timeline view logic
│   ├── settings.js        # Settings page logic
│   ├── achievements.js    # Achievements page logic
│   └── app.js            # Main application logic
├── __tests__/            # Test files
└── index.html           # Main HTML file
```

## Data Storage

The application uses localStorage for data persistence with the following structure:

- Kids data: Array of kid objects with id, name, and birthDate
- Achievements data: Array of achievement objects with id, kidId, date, description, and icon

## Browser Support

The application is optimized for Firefox browser. 
