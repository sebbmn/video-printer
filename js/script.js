/** HTML elements */
const video = document.createElement('video');
const videoNavigation = document.getElementById('video-navigation');
const printedFrames = document.getElementById('printed-frames');
const cursor = document.getElementById('cursor');

/** Variables */
let isPlaying = false;
let isCurrentPage = true;
let currentPage = [];
let pages = [];
let currentPageNumber = 0;
let frame = 0;

/** Initialization */
document.addEventListener('DOMContentLoaded', () => {
  initVideo();
  fillVideoNavigationHTML();
  fillPlayPauseButtonHTML();
  setHTMLElementsDimensions();
  initListeners();
});

function initVideo() {
  video.src = 'media/photosynthesis.mp4'; //https://ia903101.us.archive.org/15/items/photosynthesis_201911/photosynthesis.mp4
  video.id = 'video';
  video.setAttribute('playsinline','')

  video.addEventListener('play', function() {
    isPlaying = true;
  });
  
  video.addEventListener('pause', function() {
    isPlaying = false;
  });
}

function initListeners() {
  window.addEventListener('resize', () => {
    setHTMLElementsDimensions();
  });
  
  // 23fps = 1 frame every 43.478 sec
  window.setInterval(function() {
    if(isPlaying) {
      if(frame >= getParameters().maxFrames) {
        newPage()
      } else if(frame === getParameters().maxFrames - 1) {
        printedFrames.removeChild(printedFrames.firstChild);
      }
      frame++;
      printFrame();
    }
  }, getParameters().interval);

  // Frame navigation monitor
  window.setInterval(function() {
    if(isPlaying) {
      refreshNavigationFrame(currentPageNumber);
    }
  }, getParameters().interval * 1.5);

}

function getParameters() {
  const maxPages = 10;  // Display up to 10 pages on the left navigation
  const interval = 100; // A frame every 100 milisecond
  const margin = 40; // Height total margin in px

  const blockSizePx = Math.trunc((window.innerHeight - margin) / (2 * maxPages));

  const videoNavigationWidthBlks = 8;
  const videoNavigationWidthPx = videoNavigationWidthBlks * blockSizePx;

  const printedFramesWidthBlks = Math.trunc(((window.innerWidth - videoNavigationWidthPx) - 20) / blockSizePx );
  const printedFramesWidthPx = printedFramesWidthBlks * blockSizePx;

  const contentHeight = (2 * maxPages) * blockSizePx;
  const framesPerLine = Math.trunc(printedFramesWidthPx / blockSizePx);
  const maxFrames = framesPerLine * 20;

  return {
    blockSizePx,
    contentHeight,
    videoNavigationWidthPx,
    printedFramesWidthPx,
    maxFrames,
    interval,
    maxPages
  };
}

function setHTMLElementsDimensions() {
  const dimensions = getParameters();
  const navigationFrameList = document.getElementsByClassName('navigation-frame');
  const printedFrameList = document.getElementsByClassName('printed-frame');

  videoNavigation.style = `height:${dimensions.contentHeight}px;width:${dimensions.videoNavigationWidthPx}px`;
  printedFrames.style = `height:${dimensions.contentHeight}px;width:${dimensions.printedFramesWidthPx}px`;
  cursor.style = `height:${dimensions.blockSizePx}px;width:${dimensions.blockSizePx}px`;

  for (const key in navigationFrameList) {
    if(navigationFrameList[key] && navigationFrameList[key].style) {
      navigationFrameList[key].style.height = `${4 * dimensions.blockSizePx}px`;
      navigationFrameList[key].style.width = `${4 * dimensions.blockSizePx}px`;
    } 
  }

  for (const key in printedFrameList) {
    if(printedFrameList[key] && printedFrameList[key].style) {
      printedFrameList[key].style.height = `${dimensions.blockSizePx}px`;
      printedFrameList[key].style.width = `${dimensions.blockSizePx}px`;
    } 
  }
}


function fillVideoNavigationHTML() {
  const videoNavigation = document.getElementById('video-navigation');

  for(i = 0;i < getParameters().maxPages;i++) {
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
  const nextPageNumber = (currentPageNumber + 1) % getParameters().maxPages;
  const nextNavFrame = document.getElementById(`navigation-frame-${nextPageNumber}`);

  while (nextNavFrame.firstChild) {
    nextNavFrame.removeChild(nextNavFrame.firstChild);
  }

  let playPauseButton;
  let navigationFrame;

  if(document.getElementById('play-pause-button')) {
    navigationFrame = nextNavFrame;
    playPauseButton = document.getElementById('play-pause-button');
    playPauseButton.classList.add('paused');
  } else {
    navigationFrame = document.getElementById(`navigation-frame-1`);
    playPauseButton = document.createElement('button');
    playPauseButton.className = 'button';
    playPauseButton.id = 'play-pause-button';
  }
  
  navigationFrame.appendChild(playPauseButton);

  playPauseButton.addEventListener('click', () => {
    if(isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  });
}

function playVideo() {
  const playPauseButton = document.getElementById('play-pause-button');
  playPauseButton.classList.add('paused');

  if(isCurrentPage) {
    video.play();
  } else {
    navigateToPage(currentPageNumber);
    video.play();
  }
}

function pauseVideo() {
  const playPauseButton = document.getElementById('play-pause-button');
  playPauseButton.classList.remove('paused');
  video.pause();
}

function newPage() {
  const currentIndex = currentPageNumber % getParameters().maxPages;
  const currentNavFrame = document.getElementById(`navigation-frame-${currentIndex}`);

  while (printedFrames.firstChild) {
    printedFrames.removeChild(printedFrames.firstChild);
  }
  printedFrames.append(cursor);

  const index = currentPageNumber;

  currentNavFrame.firstChild.addEventListener('click', () => { 
    navigateToPage(index);
  });

  pages = [...pages, currentPage];
  currentPage = [];
  frame = 0;
  currentPageNumber++;

  fillPlayPauseButtonHTML();
}

function navigateToPage(index) {
  pauseVideo();
  const page = index === currentPageNumber ? currentPage : pages[index];
  frame = 0;

  while (printedFrames.firstChild) {
    printedFrames.removeChild(printedFrames.firstChild);
  }

  page.forEach(element => {
    printedFrames.appendChild(element);
    frame++;
  });

  if(index === currentPageNumber) {
    printedFrames.appendChild(cursor);
    isCurrentPage = true;
  } else {
    isCurrentPage = false;
  }
}

/* Refresh the navigation active frame */
function refreshNavigationFrame() {
  const navigationFrame = document.getElementById(`navigation-frame-${currentPageNumber % getParameters().maxPages}`);
  const navigationFrameCanvas = document.createElement("canvas");
  const canvasSize = 4 * getParameters().blockSizePx;

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

/* Print a frame on the right */
function printFrame() {
  const printedFrameCanvas = document.createElement("canvas");
  const size = getParameters().blockSizePx;
  const canvasSize = 4 * size;

  printedFrameCanvas.width = canvasSize;
  printedFrameCanvas.height = canvasSize;

  const printedFrameContext = printedFrameCanvas.getContext("2d");
  printedFrameContext.drawImage(video,80,0,480,480,0,0,canvasSize,canvasSize);
  printedFrameCanvas.className = "printed-frame";
  printedFrameCanvas.style = `height:${size}px;width:${size}px;`;

  printedFrameCanvas.onclick = () => { 
    window.print();
  };

  printedFrames.insertBefore(printedFrameCanvas, cursor);
  currentPage.push(printedFrameCanvas);
}
