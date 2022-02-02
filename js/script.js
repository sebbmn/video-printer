const video = document.getElementById('video');
const thumbnails = document.getElementById('thumbnails');
const videoNavigation = document.getElementById('video-navigation');

let intViewportWidth = window.innerWidth;
let intViewportHeight = window.innerHeight;

let hueVariation = 0;
let isPlaying = false;
let maxTime = 0;

initLayout();

document.addEventListener('click', () => {
  if(isPlaying) {
    video.pause();
  } else {
    video.play();
  }
});

window.addEventListener('resize', () => {
  intViewportWidth = window.innerWidth;
  intViewportHeight = window.innerHeight;
});
video.addEventListener('play', function() {
  isPlaying = true;
});
video.addEventListener('pause', function() {
  isPlaying = false;
});


// 23fps = 1 frame every 43.478 sec
window.setInterval(function() {
  if(isPlaying) {
    if(video.currentTime > maxTime) {
      maxTime = video.currentTime;
      addThumbnail(video.currentTime);
    }
  }
}, 250); 

function initLayout() {
  for(i=0;i<8;i++) {
    const newDiv = document.createElement("div");
    newDiv.className = `video-navigation-frame-${i}`;
    newDiv.style = `background-color: #${i}A${i}B${i}C`;
    videoNavigation.appendChild(newDiv);
  }
}

function addThumbnail(currentTime) {
  let thumbnailCanvas = document.createElement("canvas");
  thumbnailCanvas.width = 100;
  thumbnailCanvas.height = 100;

  let context = thumbnailCanvas.getContext("2d");
  context.filter = `hue-rotate(${hueVariation}deg)`;
  hueVariation +=5;
  context.drawImage(video,80,0,480,480,0,0,100,100);
  
  //dataUrl = thumbnailCanvas.toDataURL();
  //thumbnailImage = document.createElement('img');
  //thumbnailImage.src = dataUrl;
  thumbnailCanvas.className = "thumbnail";
  //thumbnailImage.id = currentTime;

  thumbnailCanvas.onclick = () => { 
    video.currentTime = currentTime; 
  };

  thumbnails.appendChild(thumbnailCanvas);
}
