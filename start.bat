@echo off
echo Starting Smart Portal...

start "Backend Server" cmd /k "cd /d "c:\Users\srimathi.S\OneDrive\Desktop\Mern Stack\S6 Mini project\backend" && npm run dev"

timeout /t 3

start "Frontend Server" cmd /k "cd /d "c:\Users\srimathi.S\OneDrive\Desktop\Mern Stack\S6 Mini project\frontend" && npm start"

echo Both servers starting...
