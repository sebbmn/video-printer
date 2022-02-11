const video = document.createElement('video');
const playPauseButton = document.createElement('button');

const videoNavigation = document.getElementById('video-navigation');
const printedFrames = document.getElementById('printed-frames');
const cursor = document.getElementById('cursor');

let isPlaying = false;
let isCurrentPage = true;
let maxTime = 0;
let maxLength = 35 * 60 * 1000; // 35mn max
let interval = 0;

let pages = [];
let currentPage = [];
let pageNumber = 0;
let frame = 0;
let maxFrames = 0;
let maxPages = 10;

document.addEventListener('DOMContentLoaded', () => {
  initVideo();
  fillVideoNavigationHTML();
  fillPlayPauseButtonHTML();
  setElementsDimensions();
  setParameters();
  initListeners();
});

function initVideo() {
  video.src = 'media/photosynthesis.mp4'; //https://ia903101.us.archive.org/15/items/photosynthesis_201911/photosynthesis.mp4
  video.id = 'video';

  video.addEventListener('play', function() {
    isPlaying = true;
  });
  
  video.addEventListener('pause', function() {
    isPlaying = false;
  });
}

function getDimensions() {
  intViewportWidth = window.innerWidth;
  intViewportHeight = window.innerHeight;

  const unitSizePx = Math.trunc((intViewportHeight - 50) / (2 * maxPages));
  const contentHeight = (2 * maxPages) * unitSizePx;
  const videoNavigationWidth = 8 * unitSizePx;
  const printedFramesWidth = intViewportWidth - (videoNavigationWidth + unitSizePx);

  const dimensions = {unitSizePx, contentHeight, videoNavigationWidth, printedFramesWidth};

  return dimensions;
}

function setElementsDimensions() {
  const dimensions = getDimensions();
  const navigationFrameList = document.getElementsByClassName('navigation-frame');
  const printedFrameList = document.getElementsByClassName('printed-frame');

  videoNavigation.style = `height:${dimensions.contentHeight}px;width:${dimensions.videoNavigationWidth}px`;
  printedFrames.style = `height:${dimensions.contentHeight}px;width:${dimensions.printedFramesWidth}px`;
  cursor.style = `height:${dimensions.unitSizePx}px;width:${dimensions.unitSizePx}px`;

  for (const key in navigationFrameList) {
    if(navigationFrameList[key] && navigationFrameList[key].style) {
      navigationFrameList[key].style.height = `${4 * dimensions.unitSizePx}px`;
      navigationFrameList[key].style.width = `${4 * dimensions.unitSizePx}px`;
    } 
  }

  for (const key in printedFrameList) {
    if(printedFrameList[key] && printedFrameList[key].style) {
      printedFrameList[key].style.height = `${dimensions.unitSizePx}px`;
      printedFrameList[key].style.width = `${dimensions.unitSizePx}px`;
    } 
  }
}

function setParameters() {
  const dimensions = getDimensions()
  const framesPerLine = Math.trunc(dimensions.printedFramesWidth / dimensions.unitSizePx);

  maxFrames = framesPerLine * 20;
  interval = 100 //maxLength / (maxFrames * 14);
}

function fillVideoNavigationHTML() {
  const videoNavigation = document.getElementById('video-navigation');

  for(i = 0;i < maxPages;i++) {
    const newDiv = document.createElement('div');
    newDiv.id = `navigation-frame-${i}`;
    newDiv.className = 'navigation-frame';
    newDiv.style.background = `rgb(${i * 15}, ${i * 15}, ${i * 15})`;
    videoNavigation.appendChild(newDiv);
  }

  const firstNavFrame = document.getElementById(`navigation-frame-0`);
  firstNavFrame.onclick = () => { 
    navigateToPage(0);
  };
}

function fillPlayPauseButtonHTML() {
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber + 1}`);

  playPauseButton.className = 'button';
  playPauseButton.id = 'play-pause-button';
  
  navigationFrame.appendChild(playPauseButton);

  playPauseButton.addEventListener('click', () => {
    if(isPlaying) {
      pauseVideo(playPauseButton);
    } else {
      playVideo(playPauseButton);
    }
  });
}

function playVideo(button) {
  button.classList.add('paused');
  if(isCurrentPage) {
    video.play();
  } else {
    navigateToPage(pageNumber);
    video.play();
  }
}

function pauseVideo(button) {
  video.pause();
  button.classList.remove('paused');
}

function initListeners() {
  window.addEventListener('resize', () => {
    setElementsDimensions();
    setParameters();
  });
  
  // 23fps = 1 frame every 43.478 sec
  window.setInterval(function() {
    if(isPlaying) {
      if(video.currentTime > maxTime) {
        if(frame >= maxFrames) {
          newPage()
        } else if(frame === maxFrames - 1) {
          printedFrames.removeChild(printedFrames.firstChild);
        }
        frame++;
        maxTime = video.currentTime;
        printFrame(video.currentTime);
        refreshNavigationFrame(pageNumber);
      }
    }
  }, interval); 
}

function newPage() {
  const currentPageNumber = pageNumber % maxPages;
  const newPageNumber = (pageNumber + 1) % maxPages;
  const nextPageNumber = (pageNumber + 2) % maxPages;

  const currentNavFrame = document.getElementById(`navigation-frame-${currentPageNumber}`);
  const newNavFrame = document.getElementById(`navigation-frame-${newPageNumber}`);
  const nextNavFrame = document.getElementById(`navigation-frame-${nextPageNumber}`);

  newNavFrame.removeChild(newNavFrame.firstChild);
  while (nextNavFrame.firstChild) {
    nextNavFrame.removeChild(nextNavFrame.firstChild);
  }
  nextNavFrame.appendChild(playPauseButton);

  while (printedFrames.firstChild) {
    printedFrames.removeChild(printedFrames.firstChild);
  }
  printedFrames.append(cursor);

  const index = pageNumber;

  currentNavFrame.firstChild.addEventListener('click', () => { 
    navigateToPage(index);
  });

  pages = [...pages, currentPage];
  currentPage = [];
  frame = 0;
  pageNumber++;
}

function navigateToPage(index) {
  pauseVideo(playPauseButton);
  const page = index === pageNumber ? currentPage : pages[index];
  frame = 0;

  while (printedFrames.firstChild) {
    printedFrames.removeChild(printedFrames.firstChild);
  }

  page.forEach(element => {
    printedFrames.appendChild(element);
    frame++;
  });

  if(index === pageNumber) {
    printedFrames.appendChild(cursor);
    isCurrentPage = true;
  } else {
    isCurrentPage = false;
  }
}

/* Nav frame canvas */
function refreshNavigationFrame() {
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber % maxPages}`);
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
  const size = getDimensions().unitSizePx;
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
  currentPage.push(printedFrameCanvas);
}
