const video = document.createElement('video');

const videoNavigation = document.getElementById('video-navigation');
const printedFrames = document.getElementById('printed-frames');
const cursor = document.getElementById('cursor');

let isPlaying = false;
let maxTime = 0;

let pages = [];
let pageNumber = 0;
let frame = 0;
let maxFrames = getMaxFrames();

document.addEventListener('DOMContentLoaded', () => {
  initVideo();
  fillVideoNavigationHTML();
  fillPlayPauseButtonHTML();
  setElementsDimensions();
  initListeners();
});

function initVideo() {
  video.src = 'media/photosynthesis.mp4'; //https://ia903101.us.archive.org/15/items/photosynthesis_201911/photosynthesis.mp4
  video.id = 'video';
}

function getMaxFrames() {
  const dimensions = getDimensions()
  const framesPerLine = Math.trunc(dimensions.printedFramesWidth / dimensions.unitSizePx);

  return framesPerLine * 20;
}

function getDimensions() {
  intViewportWidth = window.innerWidth;
  intViewportHeight = window.innerHeight;

  const unitSizePx = Math.trunc((intViewportHeight - 50) / 20);
  const contentHeight = 20 * unitSizePx;
  const videoNavigationWidth = 8 * unitSizePx;
  const printedFramesWidth = intViewportWidth - (videoNavigationWidth + unitSizePx);

  const dimensions = {unitSizePx, contentHeight, videoNavigationWidth, printedFramesWidth};

  return dimensions;
}

function setElementsDimensions() {
  const dimensions = getDimensions();
  // const navigationFrameList = document.getElementsByClassName('navigation-frame');
  // const printedFrameList = document.getElementsByClassName('printed-frame');

  videoNavigation.style = `height:${(dimensions.contentHeight)}px;width:${dimensions.videoNavigationWidth}px`;
  printedFrames.style = `height:${(dimensions.contentHeight)}px;width:${dimensions.printedFramesWidth}px`;
  cursor.style = `height:${(dimensions.unitSizePx)}px;width:${dimensions.unitSizePx}px`;
}

function fillVideoNavigationHTML() {
  const videoNavigation = document.getElementById('video-navigation');
  const dimensions = getDimensions();
  const size = 4 * dimensions.unitSizePx;

  for(i = 0;i < 10;i++) {
    const newDiv = document.createElement('div');
    newDiv.id = `navigation-frame-${i}`;
    newDiv.className = 'navigation-frame';
    newDiv.style = `background: #${i}A${i}B${i}C;height:${size}px;width:${size}px`;
    videoNavigation.appendChild(newDiv);
  }
}

function fillPlayPauseButtonHTML() {
  const playPauseButton = document.createElement('button');
  playPauseButton.className = 'button';
  playPauseButton.id = 'play-pause-button'
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber + 1}`);
  navigationFrame.appendChild(playPauseButton);

  playPauseButton.addEventListener('click', () => {
    playPauseButton.classList.toggle('paused');

    if(isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  });
}

function initListeners() {
  window.addEventListener('resize', () => {
    setElementsDimensions();
  });
  
  video.addEventListener('play', function() {
    isPlaying = true;
  });
  
  video.addEventListener('pause', function() {
    isPlaying = false;
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
  const playPauseButton = document.getElementById('play-pause-button')
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
  const canvasSize = 4 * getDimensions().unitSizePx;

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
  const size = getDimensions().unitSizePx
  const canvasSize = 4 * size;

  printedFrameCanvas.width = canvasSize;
  printedFrameCanvas.height = canvasSize;

  const printedFrameContext = printedFrameCanvas.getContext("2d");
  printedFrameContext.drawImage(video,80,0,480,480,0,0,canvasSize,canvasSize);
  printedFrameCanvas.className = "printed-frame";
  printedFrameCanvas.style = `height:${size}px;width:${size}px;`;

  printedFrameCanvas.onclick = () => { 
    video.currentTime = currentTime;
    window.print();
  };

  printedFrames.insertBefore(printedFrameCanvas, cursor);
}
