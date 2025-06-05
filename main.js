const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('save-audio', async (_, buffer) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Zapisz audio',
        defaultPath: 'nagranie.webm',
        filters: [{ name: 'Audio', extensions: ['webm'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return { success: true, path: filePath };
    } else {
        return { success: false };
    }
});
