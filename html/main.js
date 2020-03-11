const { app, BrowserWindow } = require('electron')

var cwd = process.cwd();
app.commandLine.appendSwitch('register-pepper-plugins', `${cwd}\\..\\Debug\\media_stream_video.dll;application/x-ppapi-HelloPPAPI`);

function createWindow () {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 800,
    height: 600,
	webPreferences: {
      nodeIntegration: true,
      'plugins': true
    }
  })
  // 加载index.html文件
  win.loadFile('index.html')
}
app.whenReady().then(createWindow)
