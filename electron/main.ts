import { app, BrowserWindow, ipcMain, shell, Menu, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const isDev = !app.isPackaged;

// Set ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));
}

function createWindow() {
    const preloadPath = path.join(app.getAppPath(), 'dist-electron', 'preload.js');

    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(__dirname, isDev ? '../public/favicon.ico' : '../dist/favicon.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: false
        },
    });

    mainWindow.setMenu(null);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.removeMenu();

    if (isDev) {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('convert-file', async (event, filePath, format, outputDir) => {
    try {
        const fileName = path.basename(filePath, path.extname(filePath));
        const finalOutputDir = outputDir || app.getPath('downloads');
        const outputPath = path.join(finalOutputDir, `${fileName}.${format}`);


        const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'avif', 'bmp'];
        const videoFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
        const audioFormats = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma'];
        const ffmpegFormats = ['ico'];

        if (imageFormats.includes(format.toLowerCase())) {
            await sharp(filePath).toFormat(format as any).toFile(outputPath);
        } else if (videoFormats.includes(format.toLowerCase()) || audioFormats.includes(format.toLowerCase()) || ffmpegFormats.includes(format.toLowerCase())) {
            await new Promise((resolve, reject) => {
                let command = ffmpeg(filePath).toFormat(format);

                if (format.toLowerCase() === 'ico') {
                    command = command.size('256x256');
                }

                command
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });
        } else {

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mammoth = require('mammoth');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const pdf = require('pdf-parse');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { Document, Packer, Paragraph, TextRun } = require('docx');

            const ext = path.extname(filePath).toLowerCase();


            const getTextContent = async (fp: string, extension: string) => {
                if (extension === '.pdf') {
                    const dataBuffer = fs.readFileSync(fp);
                    const data = await pdf(dataBuffer);
                    return data.text;
                } else if (extension === '.txt') {
                    return fs.readFileSync(fp, 'utf-8');
                } else if (extension === '.docx') {
                    const result = await mammoth.extractRawText({ path: fp });
                    return result.value;
                } else if (extension === '.odt') {
                    throw new Error("ODT conversion is not yet supported. Please convert to DOCX or PDF first.");
                }
                throw new Error(`Text extraction from ${extension} not supported.`);
            };

            if (format.toLowerCase() === 'html') {
                if (ext === '.docx') {
                    const result = await mammoth.convertToHtml({ path: filePath });
                    fs.writeFileSync(outputPath, result.value);
                } else if (ext === '.pdf' || ext === '.txt') {
                    const content = await getTextContent(filePath, ext);
                    const html = `<html><body><pre>${content}</pre></body></html>`;
                    fs.writeFileSync(outputPath, html);
                } else {
                    throw new Error(`Conversion from ${ext} to HTML not supported.`);
                }
            } else if (format.toLowerCase() === 'pdf') {
                let htmlContent = '';
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.ico'];

                if (ext === '.docx') {
                    const result = await mammoth.convertToHtml({ path: filePath });
                    htmlContent = `
                        <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                                    p { margin-bottom: 10px; line-height: 1.5; }
                                </style>
                            </head>
                            <body>${result.value}</body>
                        </html>`;
                } else if (ext === '.html') {
                    htmlContent = fs.readFileSync(filePath, 'utf-8');
                } else if (ext === '.txt') {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    htmlContent = `<html><body><pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre></body></html>`;
                } else if (imageExtensions.includes(ext)) {

                    const imageBuffer = fs.readFileSync(filePath);
                    const base64Image = imageBuffer.toString('base64');
                    const mimeType = `image/${ext.substring(1) === 'jpg' ? 'jpeg' : ext.substring(1)}`;
                    htmlContent = `
                        <html>
                            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
                                <img src="data:${mimeType};base64,${base64Image}" style="max-width: 100%; max-height: 100%;" />
                            </body>
                        </html>`;
                } else {
                    throw new Error(`Conversion from ${ext} to PDF not supported.`);
                }


                const printWindow = new BrowserWindow({
                    show: false,
                    webPreferences: { nodeIntegration: false }
                });

                const tempHtmlPath = path.join(app.getPath('temp'), `temp_conversion_${Date.now()}.html`);

                try {
                    fs.writeFileSync(tempHtmlPath, htmlContent);
                    await printWindow.loadFile(tempHtmlPath);

                    const pdfData = await printWindow.webContents.printToPDF({
                        printBackground: true,
                        pageSize: 'A4',
                        margins: { top: 0, bottom: 0, left: 0, right: 0 }
                    });

                    fs.writeFileSync(outputPath, pdfData);
                } finally {
                    printWindow.close();
                    if (fs.existsSync(tempHtmlPath)) {
                        fs.unlinkSync(tempHtmlPath);
                    }
                }
            } else if (format.toLowerCase() === 'docx') {
                const content = await getTextContent(filePath, ext);

                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: content.split('\n').map((line: string) =>
                            new Paragraph({
                                children: [new TextRun(line)],
                            })
                        ),
                    }],
                });

                const buffer = await Packer.toBuffer(doc);
                fs.writeFileSync(outputPath, buffer);
            } else if (format.toLowerCase() === 'txt') {
                const content = await getTextContent(filePath, ext);
                fs.writeFileSync(outputPath, content);
            } else {
                throw new Error(`Conversion to ${format} not yet supported locally.`);
            }
        }


        shell.showItemInFolder(outputPath);

        return { success: true, path: outputPath };

    } catch (error: any) {
        console.error('Conversion error:', error);
        const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error occurred');
        return { success: false, error: errorMessage };
    }
});

ipcMain.handle('show-in-folder', (event, filePath) => {
    shell.showItemInFolder(filePath);
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    }) as any;
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});
