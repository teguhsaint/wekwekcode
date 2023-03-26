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

  let duck_starter = vscode.commands.registerCommand("wekwekcode.duck_start", async function () {
    // array of options
    const opt2 = [
      {
        label: "Template",
        kind: vscode.QuickPickItemKind.Separator, // this is new
      },
      { label: "Bootstrap 5.3 Template", description: "Include Light & Dark Mode", items: 1 },
      { label: "CodeIgniter 4 Template", description: "Include extend & section views", items: 2 },

      {
        label: "CodeIgniter 4",
        kind: vscode.QuickPickItemKind.Separator, // this is new
      },
      { label: "Add Controller", description: "New CI4 Controller", items: 3 },
      { label: "Add Views", description: "New CI4 Views", items: 4 },
      { label: "Add Route", description: "New CI4 Route", items: 5 },

      {
        kind: vscode.QuickPickItemKind.Separator, // this is new
      },
      {
        kind: vscode.QuickPickItemKind.Separator, // this is new
      },
      { label: "Start PHP Server", items: 6 },
      {
        kind: vscode.QuickPickItemKind.Separator, // this is new
      },
    ];

    // showQuickPick
    vscode.window.showQuickPick(opt2).then((selection) => {
      if (!selection) {
        // handle no selection
        return;
      }

      // handle selected option
      switch (selection.items) {
        case 1:
          download_template.download_template_func("https://binateknologi.com/tool/ex/bs53.zip", showS);
          break;
        case 2:
          download_template.download_template_func("https://binateknologi.com/tool/ex/ci4.zip", showS);
          break;
        case 3:
          vscode.commands.executeCommand("wekwekcode.ci_controller");
          break;
        case 4:
          vscode.commands.executeCommand("wekwekcode.ci_view_extend");
          break;
        case 5:
          vscode.commands.executeCommand("wekwekcode.ci_routes");
          break;
        case 6:
          start_phpserver.start_php_server();
          break;

        default:
          break;
      }
    });
  });

  let download_filess = vscode.commands.registerCommand("wekwekcode.downloadcss_orjs", function () {
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

  context.subscriptions.push(showS, duck_starter, ci_controller, ci_routes, download_filess, ci_view_extend);
  showS.show();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
