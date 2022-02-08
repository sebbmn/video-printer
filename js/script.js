const video = document.createElement('video');
const playPauseButton = document.createElement('button');

const printedFrames = document.getElementById('printed-frames');
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
  const printedFramesX = intViewportWidth - (navX + unitSize);
  const printedFramesY = 20 * unitSize;

  maxFrames =  Math.trunc(printedFramesX / unitSize) * 20;

  videoNavigation.style = `height:${(navY)}px;width:${navX}px`;
  printedFrames.style = `height:${(printedFramesY)}px;width:${printedFramesX}px`;
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
      printFrame(video.currentTime);
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

  while (printedFrames.firstChild) {
    oldPageItems.push(printedFrames.firstChild);
    printedFrames.removeChild(printedFrames.firstChild);
  }
  printedFrames.append(cursor);

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
  while (printedFrames.firstChild) {
    printedFrames.removeChild(printedFrames.firstChild);
  }

  pages[index].forEach(element => {
    printedFrames.appendChild(element);
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

/* */
function printFrame(currentTime) {
  const printedFrameCanvas = document.createElement("canvas");
  const canvasSize = 4 * unitSize;

  printedFrameCanvas.width = canvasSize;
  printedFrameCanvas.height = canvasSize;

  const printedFrameContext = printedFrameCanvas.getContext("2d");
  printedFrameContext.drawImage(video,80,0,480,480,0,0,canvasSize,canvasSize);
  printedFrameCanvas.className = "printed-frame";
  printedFrameCanvas.style = `height:${unitSize}px;width:${unitSize}px;`;

  printedFrameCanvas.onclick = () => { 
    video.currentTime = currentTime;
    window.print();
  };

  printedFrames.insertBefore(printedFrameCanvas, cursor);
}
