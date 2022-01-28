let video = document.getElementById("video");
let thumbnails = document.getElementById("thumbnails");

let hueVariation = 0;
let isPlaying = false;
let maxTime = 0;

video.addEventListener('play', function() {
  isPlaying = true;
});
video.addEventListener('pause', function() {
  isPlaying = false;
});

document.addEventListener('click', () => {
  if(isPlaying) {
    video.pause();
  } else {
    video.play();
  }
})
// 23fps = 1 frame every 43.478 sec
window.setInterval(function() {
  if(isPlaying) {
    if(video.currentTime > maxTime) {
      maxTime = video.currentTime;
      addThumbnail(video.currentTime);
    }
  }
}, 250); 

function addThumbnail(currentTime) {
  let thumbnailCanvas = document.createElement("canvas");
  thumbnailCanvas.width = 96;
  thumbnailCanvas.height = 96;

  let context = thumbnailCanvas.getContext("2d");
  context.filter = `hue-rotate(${hueVariation}deg)`;
  hueVariation +=5;
  context.drawImage(video,80,0,480,480,0,0,96,96);
  
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
