const vscode = require("vscode");
const terci4 = vscode.window.createTerminal("CI4 Localhost");

function start_php_server() {
  terci4.show(true);
  terci4.sendText("php -S localhost:8080", true);

  vscode.window.setStatusBarMessage("Please Check In Browser Or Open Terminal with Ctrl+J");
  vscode.env.openExternal("http://localhost:8080");
}

module.exports = {
  start_php_server,
};
