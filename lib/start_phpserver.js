const vscode = require("vscode");
const terci4 = vscode.window.createTerminal("CI4 Localhost");
const myset = vscode.workspace.getConfiguration("wekwekcode");

function start_php_server() {
  terci4.show(true);
  terci4.sendText(`php -S ${myset.get("address")}`, true);

  vscode.window.setStatusBarMessage("Please Check In Browser Or Open Terminal with Ctrl+J");
  vscode.env.openExternal(`http://${myset.get("address")}`);
}

module.exports = {
  start_php_server,
};
