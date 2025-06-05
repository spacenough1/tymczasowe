const { ipcRenderer } = require('electron');

let mediaRecorder;
let audioChunks = [];
let audioBlob;

let startTime, timerInterval;
const timerElement = document.getElementById('timer');
const recordingStatus = document.getElementById('recordingStatus');

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerElement.textContent = '00:00';
}

document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});


document.getElementById('recordButton').addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    startTimer();
    recordingStatus.style.display = 'flex';

    recordButton.disabled = true;
    stopButton.disabled = false;
    saveButton.disabled = true;
    playButton.disabled = true;
});

document.getElementById('stopButton').addEventListener('click', () => {
    mediaRecorder.stop();
    stopTimer();
    recordingStatus.style.display = 'none';

    recordButton.disabled = false;
    stopButton.disabled = true;
    saveButton.disabled = false;
    playButton.disabled = false;
});

document.getElementById('saveButton').addEventListener('click', async () => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const result = await ipcRenderer.invoke('save-audio', Buffer.from(arrayBuffer));
    if (result.success) {
        alert('Zapisano');
    } else {
        alert('Blad przy zapisie');
    }
});
