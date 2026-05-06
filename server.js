const express = require('express');
const path = require('path');
const talks = require('./talks'); // Import mock data

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to get the schedule
app.get('/api/schedule', (req, res) => {
    let currentHour = 10; // Event starts at 10:00 AM
    let currentMinute = 0;
    const fullSchedule = [];

    // Helper to format time
    const formatTime = (hour, minute) => {
        const h = String(hour).padStart(2, '0');
        const m = String(minute).padStart(2, '0');
        return `${h}:${m}`;
    };

    talks.forEach((talk, index) => {
        // Add talk to schedule
        const startTime = formatTime(currentHour, currentMinute);
        currentMinute += talk.duration;
        const endTime = formatTime(currentHour, currentMinute);

        fullSchedule.push({
            type: 'talk',
            ...talk,
            startTime,
            endTime,
            rawStartTime: { hour: currentHour, minute: currentMinute - talk.duration } // Store raw for internal calculation
        });

        // Add transition time
        currentMinute += 10; // 10 minutes transition

        // Handle hour overflow
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute %= 60;
        }

        // Check for lunch break after the third talk
        if (index === 2) { // After the 3rd talk (index 2)
            const lunchStartTime = formatTime(currentHour, currentMinute);
            currentMinute += 60; // 1 hour lunch
            const lunchEndTime = formatTime(currentHour, currentMinute);

            fullSchedule.push({
                type: 'break',
                title: 'Lunch Break',
                startTime: lunchStartTime,
                endTime: lunchEndTime,
                duration: 60,
                description: 'Enjoy a delicious lunch!',
                categories: []
            });

            // Handle hour overflow after lunch
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute %= 60;
            }
        }
    });

    res.json(fullSchedule);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
