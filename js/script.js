const video = document.getElementById('video');
const thumbnails = document.getElementById('thumbnails');
const videoNavigation = document.getElementById('video-navigation');

let intViewportWidth = window.innerWidth;
let intViewportHeight = window.innerHeight;

let isPlaying = false;
let maxTime = 0;

let page = 0;
let frame = 0;

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
      frame++;
      maxTime = video.currentTime;
      addThumbnail(video.currentTime);
      refreshNavigationFrame(page);
    }
  }
}, 100); 

function initLayout() {
  for(i=0;i<8;i++) {
    const newDiv = document.createElement("div");
    newDiv.id = `navigation-frame-${i}`;
    newDiv.style = `background-color: #${i}A${i}B${i}C`;
    videoNavigation.appendChild(newDiv);
  }
}

function refreshNavigationFrame(page) {
  const navigationFrame = document.getElementById(`navigation-frame-${page}`);
  const navigationFrameCanvas = document.createElement("canvas");

  navigationFrameCanvas.width = 200;
  navigationFrameCanvas.height = 200;

  /* Nav fram canvas */
  const navigationFrameContext = navigationFrameCanvas.getContext("2d");
  navigationFrameContext.drawImage(video,80,0,480,480,0,0,200,200);

  navigationFrameCanvas.className = "navigation-frame";

  if(navigationFrame.firstChild) {
    navigationFrame.removeChild(navigationFrame.firstChild);
  }
  navigationFrame.appendChild(navigationFrameCanvas);
}

function addThumbnail(currentTime) {
  const thumbnailCanvas = document.createElement("canvas");

  thumbnailCanvas.width = 200;
  thumbnailCanvas.height = 200;

  /* Thumbnail canvas */
  const thumbnailContext = thumbnailCanvas.getContext("2d");
  thumbnailContext.drawImage(video,80,0,480,480,0,0,200,200);
  thumbnailCanvas.className = "thumbnail";

  thumbnailCanvas.onclick = () => { 
    video.currentTime = currentTime;
    window.print();
  };

  if (frame >= 448) {
    while (thumbnails.firstChild) {
      thumbnails.removeChild(thumbnails.firstChild);
    }
    frame = 0;
    page++;
  }

  thumbnails.appendChild(thumbnailCanvas);
}
