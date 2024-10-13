

let currentSong = new Audio()
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder

    let a= await fetch(`/${folder}`)
    let response = await a.text();
      
    let div = document.createElement("div")
    div.innerHTML = response
    let as= div.getElementsByTagName("a")
     songs=[]
    for(let index=0;index<as.length;index++){
        const element= as[index]
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}`)[1])
        }
    }
    
    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""; // Clear the innerHTML before appending new content
    for (const song of songs) {
        songUL.innerHTML += `
                        <li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Baba</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now
                                <img class="invert" src="play.svg" alt=""></span>
                            </div>
                            
                        </li>
                            `
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
           
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    
}
const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        currentSong.pause();
        play.src = "play.svg"; // assuming you have a play.svg icon
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    
};
async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)   
    for(let index=0; index<array.length; index++) {
        const e = array[index];
        
        // Use relative paths instead of full URLs
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = "cs" //e.getAttribute("href").split("/").slice(-2)[0];  // Get the relative folder path
            
            // Fetch the metadata of the folder
            let a= await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <button aria-label="Play 'Glory'">
                            <div style="width: 28px; height: 28px; background-color: #00FF00; 
                                        border-radius: 50%; border: 2px solid #000; padding: 4px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </button>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="Playlist Cover">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    }



    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder }`)
                     
        })
    })
}


async function main(){
    await getSongs("songs/ncs")
    playMusic(songs[0], true)
    // Display all the album on the page 
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime
        let duration = currentSong.duration
        let totalTime = 0
        if (duration) {
            totalTime = duration
        }
        let currentTimeInMinutes = Math.floor(currentTime / 60)
        let currentTimeInSeconds = Math.floor(currentTime % 60)
        let totalTimeInMinutes = Math.floor(totalTime / 60)
        let totalTimeInSeconds = Math.floor(totalTime % 60)
        let currentTimeString = currentTimeInMinutes + ":" + currentTimeInSeconds
        let totalTimeString = totalTimeInMinutes + ":" + totalTimeInSeconds
        document.querySelector(".songtime").innerHTML = currentTimeString + " / " + totalTimeString

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"

    })
    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    })

    // Add an event listener for previous
   // Add an event listener for previous
   previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
if ((index - 1) >= 0) {
  playMusic(songs[index - 1])
}
})
// Add an event listener for previous and next
next.addEventListener("click", () => {

let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
if ((index + 1) < songs.length - 1) {
  playMusic(songs[index + 1])
}
})


    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
       
        currentSong.volume= parseInt(e.target.value)/100
    })
    // l playlist whenever card is clicked

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value =0;
        
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value =10;
        }
    })
    
      
}

main()




