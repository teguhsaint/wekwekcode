const vscode = require("vscode");
const path = require("path");
const https = require("https");
const fs = require("fs");

// MODULE
const ci4_view = require("./lib/ci4_view");
const start_phpserver = require("./lib/start_phpserver");
const download_template = require("./lib/download_template");
const ci4_controller = require("./lib/ci4_controller");
const ci4_route = require("./lib/ci4_route");

// END MODULE

const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "wekwekcode" is now active!');
  let showS = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
  showS.text = "$(zap) Duck Starter";
  showS.command = "wekwekcode.duck_start";
  showS.color = "yellow";

  let rutein = vscode.commands.registerCommand("wekwekcode.downloadcss_orjs", function () {
    // Dapatkan teks yang dipilih pada editor
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor.document.getText(editor.selection);

    // Salin teks yang dipilih ke clipboard sistem
    vscode.env.clipboard
      .writeText(selectedText)
      .then(() => {
        const copiedText = selectedText;
        const pattern = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
        const urls = copiedText.match(pattern);
        if (urls) {
          console.log(urls[0]);

          const download_files = fs.createWriteStream(path.join(direktori_user, path.basename(urls[0])));

          https.get(urls[0], (response) => {
            response.pipe(download_files);
          });
          download_files.on("finish", () => {
            download_files.close();

            vscode.env.clipboard.writeText(path.basename(urls[0]));
            vscode.commands.executeCommand("editor.action.clipboardPasteAction");
            vscode.window.setStatusBarMessage(`${path.basename(urls[0])} Has Been Downloaded`);
          });
        } else {
          console.log("Tidak ada URL dalam teks yang disalin");
          vscode.window.showErrorMessage("Tidak ada URL dalam teks yang disalin");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  let duck_starter = vscode.commands.registerCommand("wekwekcode.duck_start", async function () {
    // array of options
    const options = ["Bootstrap 5.3 Template", "CodeIgniter 4 Template", "Start PHP Server"];
    // showQuickPick
    vscode.window.showQuickPick(options).then((selection) => {
      if (!selection) {
        // handle no selection
        return;
      }

      // handle selected option
      switch (selection) {
        case "Bootstrap 5.3 Template":
          download_template.download_template_func("https://binateknologi.com/tool/ex/bs53.zip", showS);
          break;
        case "CodeIgniter 4 Template":
          download_template.download_template_func("https://binateknologi.com/tool/ex/ci4.zip", showS);
          break;
        case "Start PHP Server":
          start_phpserver.start_php_server();
          break;

        default:
          break;
      }
    });
  });

  let ci_controller = vscode.commands.registerCommand("wekwekcode.ci_controller", function () {
    ci4_controller.cicontroller_func();
  });

  let ci_routes = vscode.commands.registerCommand("wekwekcode.ci_routes", function () {
    ci4_route.tambah_route();
  });

  let ci_view_extend = vscode.commands.registerCommand("wekwekcode.ci_view_extend", async function () {
    const nama_file = await vscode.window.showInputBox({ placeHolder: "Masukkan Nama File Template" });
    if (nama_file) {
      ci4_view.buat_views(nama_file);
    }
  });

  context.subscriptions.push(showS, duck_starter, ci_controller, ci_routes, rutein, ci_view_extend);
  showS.show();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
