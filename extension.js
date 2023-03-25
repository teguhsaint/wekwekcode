const vscode = require("vscode");
const path = require("path");
const https = require("https");
const fs = require("fs");
const decompress = require("decompress");
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

  let rutein = vscode.commands.registerCommand("wekwekcode.rutein", function () {
    // Dapatkan teks yang dipilih pada editor
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor.document.getText(editor.selection);

    // Salin teks yang dipilih ke clipboard sistem
    vscode.env.clipboard
      .writeText(selectedText)
      .then(() => {
        console.log("Teks berhasil disalin ke clipboard " + selectedText);
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
          download_template_func("https://binateknologi.com/tool/ex/bs53.zip", showS);
          break;
        case "CodeIgniter 4 Template":
          download_template_func("https://binateknologi.com/tool/ex/ci4.zip", showS);
          break;
        case "Start PHP Server":
          start_php_server();
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

  context.subscriptions.push(showS, duck_starter, ci_controller, ci_routes, rutein);
  showS.show();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

function download_template_func(urlkus, statusbar) {
  statusbar.hide();

  let st2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
  st2.text = "$(sync~spin) Duck is Busy Right Now..";
  st2.color = "red";
  st2.show();

  var urlku = urlkus;
  const basename = path.basename(urlku);
  const filzip = fs.createWriteStream(path.join(direktori_user, path.basename(urlku)));
  https.get(urlku, (response) => {
    vscode.window.setStatusBarMessage("Tunggu Sebentar.. Download Zip File...", 8500);

    var cur = 0;
    var len = parseInt(response.headers["content-length"], 10);

    response.on("data", function (chunk) {
      cur += chunk.length;
      vscode.window.setStatusBarMessage("Downloading " + ((100.0 * cur) / len).toFixed(2) + "%  Size : " + (cur / 1048576).toFixed(2) + " mb", 5000);
    });
    response.pipe(filzip);
    filzip.on("finish", (err) => {
      if (err) {
        console.log(err);
        return;
      }
      filzip.close();
      console.log("fone");

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: "Unzipping files...",
          cancellable: false,
        },
        async () => {
          try {
            const files = await decompress(direktori_user + "/" + basename, direktori_user)
              .then(() => {
                fs.unlink(direktori_user + "/" + basename, () => {});
                vscode.window.setStatusBarMessage("Selesai..", 5000);
              })
              .catch((error) => {
                console.log(error);
              });

            vscode.window.showInformationMessage(`Selesai..`);
            st2.hide();
            statusbar.show();
          } catch (error) {
            vscode.window.showErrorMessage(`Error unzipping files: ${error.message}`);
          }
        }
      );
    });
  });
}

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

function start_php_server() {
  const terci4 = vscode.window.createTerminal("CI4 Localhost");
  terci4.show(true);
  terci4.sendText("php -S localhost:8080", true);

  vscode.window.setStatusBarMessage("Please Check In Browser Or Open Terminal with Ctrl+J");
  vscode.env.openExternal("http://localhost:8080");
}
