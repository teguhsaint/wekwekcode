const vscode = require("vscode");
const path = require("path");
const https = require("https");
const fs = require("fs");

// MODULE
const buat_view = require("./lib/buat_view_ci4");
const start_phpserver = require("./lib/start_phpserver");
const download_template = require("./lib/download_template");

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
    cicontroller_func();
  });

  let ci_routes = vscode.commands.registerCommand("wekwekcode.ci_routes", function () {
    tambah_route();
  });

  let ci_view_extend = vscode.commands.registerCommand("wekwekcode.ci_view_extend", async function () {
    const nama_file = await vscode.window.showInputBox({ placeHolder: "Masukkan Nama File Template" });
    if (nama_file) {
      buat_view.buat_views(nama_file);
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

function cicontroller_func() {
  const dir_controller = path.join(direktori_user, "app/Controllers/");

  async function hh() {
    const nama_file = await vscode.window.showInputBox({ title: "Nama File Controller tanpa .php tidak boleh ada spasi" });
    function capitalize(s) {
      return s[0].toUpperCase() + s.slice(1);
    }
    if (!nama_file) {
      vscode.window.showErrorMessage("Nama Tidak Boleh Kosong");
    } else {
      const file_Controller = fs.createWriteStream(dir_controller + "/" + capitalize(nama_file.replaceAll(" ", "")) + ".php", (err) => {
        if (err) {
          console.log(err);
        }
      });

      const isi_controller = `<?php

namespace App\\Controllers;

class ${capitalize(nama_file.replaceAll(" ", ""))} extends BaseController
{
    public function index()
    {
        // return view('');
    }
}
`;
      file_Controller.write(isi_controller, (err) => {
        if (err) {
          file_Controller.close();
          console.log(err);
        } else {
          file_Controller.close();
          vscode.window.showInformationMessage("Done " + nama_file);
          const openPath = vscode.Uri.file(path.join(dir_controller, capitalize(nama_file) + ".php"));
          vscode.commands.executeCommand("vscode.open", openPath);
        }
      });
    }
  }
  hh();
}

function tambah_route() {
  const routes_path = path.join(direktori_user, "app/Config/Routes.php");

  async function tambah() {
    const route_path = await vscode.window.showInputBox({ title: "Masukkan link tujuan" });
    const controller_tujuan = await vscode.window.showInputBox({ title: "Masukkan Controller Tujuan" });

    if (!route_path) {
      vscode.window.showErrorMessage("Path route tidak boleh kosong");
    } else {
      const new_route = `$routes->get('/${route_path}','${controller_tujuan}::index');\n`;

      fs.readFile(routes_path, "utf8", function (err, data) {
        if (err) {
          console.log(err);
          vscode.window.showErrorMessage("Gagal membaca file routes.php");
        } else {
          // Cari baris yang ingin ditambahkan setelahnya
          const target_line = `$routes->get('/', 'Home::index');`;

          // Split data berdasarkan baris
          const lines = data.split("\n");

          // Cari indeks baris yang ingin ditambahkan setelahnya
          const target_index = lines.findIndex((line) => line.includes(target_line));

          if (target_index === -1) {
            vscode.window.showErrorMessage("Tidak dapat menemukan baris target");
            return;
          }

          // Tambahkan baris baru setelah baris target
          lines.splice(target_index + 1, 0, new_route);

          // Gabungkan kembali data menjadi string dan tulis ke file
          fs.writeFile(routes_path, lines.join("\n"), function (err) {
            if (err) {
              console.log(err);
              vscode.window.showErrorMessage("Gagal menambahkan route");
            } else {
              vscode.window.showInformationMessage("Berhasil menambahkan route");
            }
          });
        }
      });
    }
  }

  tambah();
}
