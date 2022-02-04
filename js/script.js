const video = document.getElementById('video');
const thumbnails = document.getElementById('thumbnails');
const videoNavigation = document.getElementById('video-navigation');
const playPauseButton = document.createElement('button');

let intViewportWidth, intViewportHeight, isPlaying, maxTime, pages, pageNumber, frame, maxFrames;

startupPage();

function startupPage() {
  initVariables();
  initLayout();
  initListeners();
}

function initVariables() {
  playPauseButton.className = 'button';

  intViewportWidth = window.innerWidth;
  intViewportHeight = window.innerHeight;

  isPlaying = false;
  maxTime = 0;

  pages = [];
  pageNumber = 0;
  frame = 0;
  maxFrames = 448;
}

function initLayout() {
  for(i=0;i<8;i++) {
    const newDiv = document.createElement("div");
    newDiv.id = `navigation-frame-${i}`;
    newDiv.className = 'navigation-frame';
    newDiv.style = `background: #${i}A${i}B${i}C`;
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
      if (frame >= 448) {
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
  frame = 448;
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

  navigationFrameCanvas.width = 200;
  navigationFrameCanvas.height = 200;

  const navigationFrameContext = navigationFrameCanvas.getContext("2d");
  navigationFrameContext.drawImage(video,80,0,480,480,0,0,200,200);

  navigationFrameCanvas.className = "navigation-frame-canvas";

  if(navigationFrame.firstChild) {
    navigationFrame.removeChild(navigationFrame.firstChild);
  }
  navigationFrame.appendChild(navigationFrameCanvas);
}

/* Thumbnail canvas */
function addThumbnail(currentTime) {
  const thumbnailCanvas = document.createElement("canvas");

  thumbnailCanvas.width = 200;
  thumbnailCanvas.height = 200;

  const thumbnailContext = thumbnailCanvas.getContext("2d");
  thumbnailContext.drawImage(video,80,0,480,480,0,0,200,200);
  thumbnailCanvas.className = "thumbnail";

  thumbnailCanvas.onclick = () => { 
    video.currentTime = currentTime;
    window.print();
  };

  thumbnails.appendChild(thumbnailCanvas);
}
