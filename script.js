let currentSong = new Audio();
let songs;
let currFolder;

//clickable home button
document.getElementById('home').addEventListener('click', () => { location.href = location.href })

//function to convert seconds in minutes for song time and duration
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//logic to fetch the songs from a playlist
async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`/${folder}/info.json`);
    let data = await res.json();
    songs = data.songs;

    let songUL = document.querySelector(".library ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li class="cursor">
                <span class="song-details">${song.replaceAll("%20", " ")}</span>
                <span class="playnow-btn">play now 
                    <img src="images/play_now.svg" alt="Play Button" width="30" height="30" style="transform: scale(0.4);">
                </span>
            </li>`;
    }

    // Click event to play song
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".song-details").innerHTML.trim());
        });
    });

    return songs;
}



//logic to play music
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById('playnpause').src = "images/pause.svg";
    }
    document.querySelector(".song-detail").innerHTML = decodeURI(track);
    document.querySelector(".song-current-time").innerHTML = "00:00";
}


//logic to display albums in the main content
async function displayAlbums() {
    const albumList = [
        "playlist_1",
        "playlist_2",
        "playlist_3",
        "playlist_4",
        "playlist_5",
        "playlist_6",
        "playlist_7",
        "playlist_8",
        "playlist_9",
        "playlist_10",
        "playlist_11",
        "playlist_12"
        // Add more folder names here if you have more albums
    ];

    const cardContainer = document.querySelector(".playlists");
    cardContainer.innerHTML = "";

    for (let folder of albumList) {
        try {
            const res = await fetch(`/songs/${folder}/info.json`);
            const info = await res.json();

            cardContainer.innerHTML += `
                <div class="card cursor" data-folder="${folder}">
                    <div class="image">
                        <img class="image-img" src="/songs/${folder}/cover.jpg" alt="">
                        <img class="image-play-btn" src="images/play_button_black_center.svg" alt="" width="40px" height="40px">
                    </div>
                    <div class="song-title">${info.title}</div>
                    <div class="song-discription">${info.description}</div>
                </div>
            `;
        } catch (err) {
            console.error(`Error loading album ${folder}:`, err);
        }
    }

    // Load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}


//styling for slider and volume
const slider = document.querySelector(".spotify-slider");
function updateSliderBackground(el) {
    const value = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.background = `linear-gradient(to right, #1db954 ${value}%, #ffffff22 ${value}%)`;
}
slider.addEventListener("input", () => updateSliderBackground(slider));
updateSliderBackground(slider); // Initialize
const volume = document.querySelector(".volume-slider");
volume.addEventListener("input", () => updateSliderBackground(volume));
updateSliderBackground(volume); // Initialize

//logic for cross button
document.querySelector(".cross").addEventListener('click', () => {
    document.querySelector('.left').style.left = "-150%"
})

//logic for hamburger button
document.querySelector(".hamburger").addEventListener('click', () => {
    document.querySelector('.left').style.left = "0"
})

//logic for fullscreen and exit fullscreen
let fullScreen = false;
function fullscreen() {
    const elem = document.body;
    let elefullscreen = document.getElementById('fullscreen');
    if (!fullScreen) {
        elefullscreen.src = 'images/exitfullscreen.svg';
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
        document.getElementsByTagName('footer')[0].style.padding = '20px 10px'
        fullScreen = true;
    } else {
        elefullscreen.src = 'images/fullscreen.svg';
        document.exitFullscreen();
        document.getElementsByTagName('footer')[0].style.padding = '5px 15px'
        fullScreen = false;
    }
}

async function main() {
    // Load a default playlist (first one)
    await getSongs("songs/playlist_1");
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Play/Pause logic
    document.getElementById("playnpause").addEventListener("click", (e) => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("playnpause").src = "images/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("playnpause").src = "images/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        const progressSlider = document.querySelector(".spotify-slider");
        document.querySelector(".song-current-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".song-duration").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".spotify-slider").value = (currentSong.currentTime / currentSong.duration) * 100;
        // Update slider value
        progressSlider.value = (currentSong.currentTime / currentSong.duration) * 100;
        // ✅ Update the linear gradient
        updateSliderBackground(progressSlider);
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            progressSlider.value = (currentSong.currentTime / currentSong.duration) * 100;
            updateSliderBackground(progressSlider);
        }
    });

    // Seekbar change
    document.querySelector(".spotify-slider").addEventListener("change", e => {
        let percent = document.querySelector('.spotify-slider').value;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Previous / Next controls
    previous.addEventListener("click", () => {
        currentSong.pause();
        document.getElementById("playnpause").src = "images/play.svg";
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        document.getElementById("playnpause").src = "images/play.svg";
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume clickable button
    document.querySelector(".volumebtn").addEventListener('click', () => {
        const volumeBtn = document.querySelector(".volumebtn");
        const volumeSlider = document.querySelector(".volume-slider");

        if (currentSong.volume > 0) {
            // Mute the audio
            currentSong.volume = 0;
            volumeSlider.value = 0;
            volumeBtn.src = 'images/mute.svg';
        } else {
            // Unmute the audio to a default level (e.g., 50%)
            currentSong.volume = 0.5;
            volumeSlider.value = 50;
            volumeBtn.src = 'images/volume.svg';
        }

        updateSliderBackground(volumeSlider);
    });


    // Volume change
    document.querySelector(".volume-slider").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            document.querySelector('.volumebtn').src = 'images/mute.svg'
        } else {
            document.querySelector('.volumebtn').src = 'images/volume.svg'
        }
    });
}


main() 