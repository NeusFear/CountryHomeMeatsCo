export function getDayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 8.64e+7)
}

export const normalizeDay = (date: Date = new Date()) => 
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

export const formatPhoneNumber = (numStr: String) => {
    return "(" + numStr.substr(0, 3) + ") " + numStr.substr(3, 3) + "-" + numStr.substr(6);
}

  //This doesn't work, but we need something like this that does.
export const printPage = (name: String) => {
  
  const ch = require('child_process');

  switch (process.platform) {
      case 'darwin':
      case 'linux':
          ch.exec(
              'lp ' + name, (e) => {
                  if (e) {
                      throw e;
                  }
              });
          break;
      case 'win32':
          ch.exec(
              'ptp ' + name, {
                  windowsHide: true
              }, (e) => {
                  if (e) {
                      throw e;
                  }
              });
          break;
      default:
          throw new Error(
              'Platform not supported.'
          );
  }
}