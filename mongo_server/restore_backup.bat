echo off
cd "%USERPROFILE%\Desktop\Server Backups\"
echo "Please selected a backup from the following: (Press tab to switch)"
:start
dir /b /a-d
set /p id=Enter Backup Name: 
if not exist "%USERPROFILE%\Desktop\Server Backups\%id%" (
	echo File %id% could not be found. Please select again.
	echo 
	goto start
)

"C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --drop --gzip --archive="%USERPROFILE%\Desktop\Server Backups\%id%"
pause