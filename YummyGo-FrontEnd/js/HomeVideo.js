const video = document.getElementById('home-video');

video.addEventListener('loadedmetadata', function () {
const duration = video.duration;
const loopStart = duration - 2; // Last 2 seconds

video.currentTime = 0;
video.play();

video.addEventListener('timeupdate', function () {
    if (video.currentTime >= duration) {
    video.currentTime = loopStart;
    video.play();
    }
});
});