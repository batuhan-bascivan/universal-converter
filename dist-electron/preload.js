"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron = require('electron');
console.log('Preload script loaded');
electron_1.contextBridge.exposeInMainWorld('electron', {
    convertFile: (filePath, format, outputDir) => electron_1.ipcRenderer.invoke('convert-file', filePath, format, outputDir),
    showInFolder: (filePath) => electron_1.ipcRenderer.invoke('show-in-folder', filePath),
    selectDirectory: () => electron_1.ipcRenderer.invoke('select-directory'),
    getFilePath: (file) => {
        try {
            const webUtils = electron.webUtils || electron.default?.webUtils;
            if (webUtils && typeof webUtils.getPathForFile === 'function') {
                return webUtils.getPathForFile(file);
            }
        }
        catch (e) {
            console.error('Error accessing webUtils:', e);
        }
        console.warn('Falling back to file.path');
        return file.path || '';
    },
});
