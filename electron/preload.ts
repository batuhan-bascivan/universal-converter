import { contextBridge, ipcRenderer } from 'electron';


const electron = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electron', {
    convertFile: (filePath: string, format: string, outputDir?: string) => ipcRenderer.invoke('convert-file', filePath, format, outputDir),
    showInFolder: (filePath: string) => ipcRenderer.invoke('show-in-folder', filePath),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getFilePath: (file: File) => {
        try {

            const webUtils = electron.webUtils || (electron as any).default?.webUtils;

            if (webUtils && typeof webUtils.getPathForFile === 'function') {
                return webUtils.getPathForFile(file);
            }
        } catch (e) {
            console.error('Error accessing webUtils:', e);
        }

        console.warn('Falling back to file.path');
        return (file as any).path || '';
    },
});
