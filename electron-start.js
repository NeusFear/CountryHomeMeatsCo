const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = false;
const { ipcMain } = require('electron');
const { PosPrinter } = require("electron-pos-printer");

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      titleBarStyle: "hiddenInset",
      webPreferences: {
        nodeIntegration: true
      }
    });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:1234"
      : `file://${path.join(__dirname, "/dist/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("get-printers", (evnt) => {
  evnt.returnValue = mainWindow.webContents.getPrinters()
})
ipcMain.on("do-print", (_, args) => {
  PosPrinter.print(args[0], args[1])
  .then(() => {})
  .catch(e => console.error(e))
})


