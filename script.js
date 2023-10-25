// Update the time every second
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Display current time
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Calculate time remaining until 16:27
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 27);
    
    let millisecondsUntilTarget = targetTime - now;

    // If the current time is past the target time, calculate overtime
    if (now > targetTime) {
        millisecondsUntilTarget = now - targetTime;
        const hoursOvertime = Math.floor(millisecondsUntilTarget / (1000 * 60 * 60));
        const minutesOvertime = Math.floor((millisecondsUntilTarget % (1000 * 60 * 60)) / (1000 * 60));
        
        // Display overtime
        document.getElementById('timeRemaining').textContent = `Overtime: ${hoursOvertime}h${minutesOvertime}m`;
    } else {
        // If the current time is before the target time, calculate time remaining
        const hoursRemaining = Math.floor(millisecondsUntilTarget / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((millisecondsUntilTarget % (1000 * 60 * 60)) / (1000 * 60));
        
        // Display time remaining
        document.getElementById('timeRemaining').textContent = `Time left: ${hoursRemaining}h${minutesRemaining}m`;
    }
}


// Calculate the current week number
function updateWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
    document.getElementById('week-number').textContent = `${week}`;
}

function updateSongInfo() {
    fetch('https://api.sr.se/api/v2/playlists/rightnow?channelid=203')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            // console.log("XML: ", xmlDoc)
            
            const song = xmlDoc.getElementsByTagName("song")[0];
            let songInfo;
            if (song) {
                const artist = song.getElementsByTagName("artist")[0].textContent;
                const title = song.getElementsByTagName("title")[0].textContent;
                songInfo = `${artist} - ${title}`;
                document.getElementById('current-song').textContent = songInfo;
            } else {
                fetch('https://api.sr.se/api/v2/programs/index?channelid=203')
                    .then(response => response.text())
                    .then(data => {
                        const programData = (new window.DOMParser()).parseFromString(data, "text/xml");
                        const now = new Date();
                        const currentTime = now.getHours() * 60 + now.getMinutes();  // convert to minutes
                        const currentDay = now.getDay();  // 0 for Sunday, 1 for Monday, etc.

                        let currentProgram = 'No program information available';

                        // Iterate through each program
                        programData.querySelectorAll('program').forEach(program => {
                            // console.log("Programmis: ", program)
                            const broadcastInfo = program.querySelector('broadcastinfo').textContent;
                            const daysOfWeek = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
                            if (broadcastInfo.includes(daysOfWeek[currentDay])) {
                                const timeRange = broadcastInfo.match(/(\d+:\d+)\s*-\s*(\d+:\d+)/);
                                if (timeRange) {
                                    const [startHours, startMinutes] = timeRange[1].split(':').map(Number);
                                    const [endHours, endMinutes] = timeRange[2].split(':').map(Number);
                                    const startTime = startHours * 60 + startMinutes;
                                    const endTime = endHours * 60 + endMinutes;

                                    // Check if the current time is within the program's broadcast time
                                    if (currentTime >= startTime && currentTime <= endTime) {
                                        currentProgram = program.querySelector('name').textContent;
                                        // console.log("Curry: ", currentProgram);
                                    }
                                }
                            }
                        });

                        document.getElementById('current-song').textContent = `Current Program: ${currentProgram}`;
                    });
            }
        });
}

function updateWeather() {
    const lat = 57.78145;
    const lon = 14.15618;
    fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`)
        .then(response => response.json())
        .then(data => {
            const latestForecast = data.timeSeries[0];
            const temperature = latestForecast.parameters.find(param => param.name === 't').values[0];
            const windSpeed = latestForecast.parameters.find(param => param.name === 'ws').values[0];
            const wsymb2 = latestForecast.parameters.find(param => param.name === 'Wsymb2').values[0];

            // Assume icons are named like "1.png", "2.png", ..., "27.png" and are in the "icons" directory
            const iconUrl = `./weathericons/${wsymb2}.png`;

            document.getElementById('weather-info').innerHTML = `<img src="${iconUrl}" alt="Weather icon" id="weather-icon"> Temp: ${temperature}°C, Wind: ${windSpeed} m/s`;
        });
}



// Call the function to get the weather info
updateWeather();

// Optional: Update the weather info every hour
setInterval(updateWeather, 60 * 60 * 1000);


// Call the function to get the song info or current program
updateSongInfo();

function getProgram(){
    fetch('https://api.sr.se/api/v2/channels/203').then(response => {
        // console.log("Prog-respons: ", response);
    })
}

// Play the radio stream
document.getElementById('playButton').addEventListener('click', () => {
    document.getElementById('radioStream').play();
});

// Stop the radio stream
document.getElementById('stopButton').addEventListener('click', () => {
    document.getElementById('radioStream').pause();
});

// Initial setup
'getProgram();'
updateWeather();
updateSongInfo();
updateTime();
updateWeek();
setInterval(updateTime, 1000);
setInterval(updateSongInfo, 10 * 1000);
setInterval(updateWeather, 1 * 60 * 1000);
