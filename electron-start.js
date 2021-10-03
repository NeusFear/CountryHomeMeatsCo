const electron = require("electron");
const app = electron.app;
if (handleSquirrelEvent()) {
  return;
}
const fs = require("fs")
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

const pinnedUserPath = app.getPath("userData") + "/" + "CountryHomeMeatsPinnedUsers.txt"

ipcMain.on("get-pinned-users", (evnt) => {
  if(fs.existsSync(pinnedUserPath)) {
    evnt.returnValue = fs.readFileSync(pinnedUserPath).toString().split("\n")
  } else {
    evnt.returnValue = []
  }
  
})

ipcMain.on("save-pinned-users", (_, list) => {
  fs.writeFileSync(pinnedUserPath, list.join("\n"))
})

ipcMain.on("get-printers", (evnt) => {
  evnt.returnValue = mainWindow.webContents.getPrinters()
})
ipcMain.on("do-print", (_, args) => {
  PosPrinter.print(args[0], args[1])
  .then(() => {})
  .catch(e => console.error(e))
})

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};
