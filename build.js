const packager = require('electron-packager');
const electronInstaller = require('electron-winstaller');

async function build(options) {
    const appPaths = await packager(options);

    console.log(`✅ App build ready in: ${appPaths.join('\n')}, creating installer...`);

    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: './build/app-win32-ia32',
            outputDirectory: './build/installer',
            authors: 'Wyn Price, Brandon Davis',
            description: 'Made for country home meats (https://www.countryhomemeats.com/)',
            exe: 'app.exe',
            setupExe: 'setup.exe'
        });

        console.log('💻 Installer is created in dist/installer');
    } catch (e) {
        console.log(`The following error occured: ${e.message}`);
    }
};

build({
    name: 'app',
    dir: './',
    out: './build',
    overwrite: true,
    asar: true,
    platform: 'win32',
    arch: 'ia32'
});