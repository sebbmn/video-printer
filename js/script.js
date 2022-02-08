const video = document.createElement('video');
const playPauseButton = document.createElement('button');

const thumbnails = document.getElementById('thumbnails');
const videoNavigation = document.getElementById('video-navigation');
const cursor = document.getElementById('cursor');

let intViewportWidth, intViewportHeight, isPlaying, maxTime, pages, pageNumber, frame, maxFrames, unitSize;

document.addEventListener('DOMContentLoaded', () => {
  initVideo();
  initVariables();
  initLayout();
  initListeners();
  draw();
});

function initVariables() {
  playPauseButton.className = 'button';

  intViewportWidth = window.innerWidth;
  intViewportHeight = window.innerHeight;

  isPlaying = false;
  maxTime = 0;

  pages = [];
  pageNumber = 0;
  frame = 0;

  unitSize = Math.trunc((intViewportHeight - 50) / 20);
}

function initVideo() {
  video.src = 'media/photosynthesis.mp4'; //https://ia903101.us.archive.org/15/items/photosynthesis_201911/photosynthesis.mp4
  video.id = 'video';
}

function initLayout() {
  const navX = 8 * unitSize;
  const navY = 20 * unitSize;
  const thumbnailsX = intViewportWidth - (navX + unitSize);
  const thumbnailsY = 20 * unitSize;

  maxFrames =  Math.trunc(thumbnailsX / unitSize) * 20;

  videoNavigation.style = `height:${(navY)}px;width:${navX}px`;
  thumbnails.style = `height:${(thumbnailsY)}px;width:${thumbnailsX}px`;
  cursor.style = `height:${(unitSize)}px;width:${unitSize}px`;
}

function draw() {
  for(i=0;i<10;i++) {
    const newDiv = document.createElement("div");
    newDiv.id = `navigation-frame-${i}`;
    newDiv.className = 'navigation-frame';
    newDiv.style = `background: #${i}A${i}B${i}C;height:${4* unitSize}px;width:${4 * unitSize}px`;
    videoNavigation.appendChild(newDiv);
  }

  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber + 1}`);
  navigationFrame.appendChild(playPauseButton);
}

function initListeners() {
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

  playPauseButton.addEventListener('click', () => {
    playPauseButton.classList.toggle('paused');

    if(isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  });
}

// 23fps = 1 frame every 43.478 sec
window.setInterval(function() {
  if(isPlaying) {
    if(video.currentTime > maxTime) {
      if (frame >= maxFrames - 1) {
        newPage()
      }
      frame++;
      maxTime = video.currentTime;
      addThumbnail(video.currentTime);
      refreshNavigationFrame(pageNumber);
    }
  }
}, 100); 

function newPage() {
  const currentNavFrame = document.getElementById(`navigation-frame-${pageNumber}`);
  const newNavFrame = document.getElementById(`navigation-frame-${pageNumber + 1}`);
  const nextNavFrame = document.getElementById(`navigation-frame-${pageNumber + 2}`);
  const oldPageItems = [];

  newNavFrame.removeChild(newNavFrame.firstChild);
  nextNavFrame.appendChild(playPauseButton);

  while (thumbnails.firstChild) {
    oldPageItems.push(thumbnails.firstChild);
    thumbnails.removeChild(thumbnails.firstChild);
  }
  thumbnails.append(cursor);

  const index = pageNumber;
  currentNavFrame.onclick = () => { 
    navigateToPage(index);
  };

  pages = [...pages, oldPageItems];
  frame = 0;
  pageNumber++;
}

function navigateToPage(index) {
  video.pause();
  frame = maxFrames;
  while (thumbnails.firstChild) {
    thumbnails.removeChild(thumbnails.firstChild);
  }

  pages[index].forEach(element => {
    thumbnails.appendChild(element);
  });
}

/* Nav frame canvas */
function refreshNavigationFrame() {
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber}`);
  const navigationFrameCanvas = document.createElement("canvas");
  const canvasSize = 4 * unitSize;

  navigationFrameCanvas.width = canvasSize;
  navigationFrameCanvas.height = canvasSize;

  const navigationFrameContext = navigationFrameCanvas.getContext("2d");
  navigationFrameContext.drawImage(video,80,0,480,480,0,0,canvasSize,canvasSize);

  navigationFrameCanvas.className = "navigation-frame-canvas";

  if(navigationFrame.firstChild) {
    navigationFrame.removeChild(navigationFrame.firstChild);
  }
  navigationFrame.appendChild(navigationFrameCanvas);
}

/* Thumbnail canvas */
function addThumbnail(currentTime) {
  const thumbnailCanvas = document.createElement("canvas");
  const canvasSize = 4 * unitSize;

  thumbnailCanvas.width = canvasSize;
  thumbnailCanvas.height = canvasSize;

  const thumbnailContext = thumbnailCanvas.getContext("2d");
  thumbnailContext.drawImage(video,80,0,480,480,0,0,canvasSize,canvasSize);
  thumbnailCanvas.className = "thumbnail";
  thumbnailCanvas.style = `height:${unitSize}px;width:${unitSize}px;`;

  thumbnailCanvas.onclick = () => { 
    video.currentTime = currentTime;
    window.print();
  };

  thumbnails.insertBefore(thumbnailCanvas, cursor);
}
