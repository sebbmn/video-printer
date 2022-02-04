const video = document.getElementById('video');
const thumbnails = document.getElementById('thumbnails');
const videoNavigation = document.getElementById('video-navigation');

let intViewportWidth = window.innerWidth;
let intViewportHeight = window.innerHeight;

let isPlaying = false;
let maxTime = 0;

let pages = [];
let pageNumber = 0;
let frame = 0;
let maxFrames = 448;

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

function initLayout() {
  for(i=0;i<8;i++) {
    const newDiv = document.createElement("div");
    newDiv.id = `navigation-frame-${i}`;
    newDiv.style = `background-color: #${i}A${i}B${i}C`;
    videoNavigation.appendChild(newDiv);
  }
}

function newPage() {
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber}`);
  const oldPageItems = [];

  while (thumbnails.firstChild) {
    oldPageItems.push(thumbnails.firstChild);
    thumbnails.removeChild(thumbnails.firstChild);
  }

  navigationFrame.onclick = () => { 
    navigateToPage(pageNumber);
  };

  pages = [...pages, oldPageItems];
  frame = 0;
  pageNumber++;
}

function navigateToPage(index) {
  /*video.pause();

  while (thumbnails.firstChild) {
    thumbnails.removeChild(thumbnails.firstChild);
  }

  pages[index].forEach(element => {
    thumbnails.appendChild(element);
  });*/
  console.log(pages[index], pages[0], index);
  //thumbnails = pages[index];
}

/* Nav frame canvas */
function refreshNavigationFrame() {
  const navigationFrame = document.getElementById(`navigation-frame-${pageNumber}`);
  const navigationFrameCanvas = document.createElement("canvas");

  navigationFrameCanvas.width = 200;
  navigationFrameCanvas.height = 200;

  const navigationFrameContext = navigationFrameCanvas.getContext("2d");
  navigationFrameContext.drawImage(video,80,0,480,480,0,0,200,200);

  navigationFrameCanvas.className = "navigation-frame";

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
