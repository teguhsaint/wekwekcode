const vscode = require("vscode");
const path = require("path");
const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);
const fs = require("fs");
const parser = require("php-parser");

function tambah_route() {
  const routes_path = path.join(direktori_user, "app/Config/Routes.php");

  async function tambah() {
    const route_path = await vscode.window.showInputBox({ title: "Masukkan link tujuan" });

    const dirPath = path.join(direktori_user, "app/Controllers/");

    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        vscode.window.showErrorMessage("Failed to read directory.");
        return;
      }

      const fileNames = files.map((file) => {
        return path.parse(file).name;
      });

      await vscode.window.showQuickPick(fileNames).then(async (selectedFileName) => {
        if (selectedFileName) {
          let filePath = path.join(direktori_user, "app/Controllers", selectedFileName + ".php");

          const fileContent = fs.readFileSync(filePath, "utf8");
          let namaClass = "";
          const ast = parser.parseCode(fileContent);
          const myfunc = [];
          ast.children.forEach((node) => {
            node.children.forEach((node) => {
              namaClass = node.name.name;
              node.body.forEach((node) => {
                myfunc.push(node.name.name);
              });
            });
          });
          await vscode.window.showQuickPick(myfunc).then((selectFunction) => {
            const new_route = `$routes->get('/${route_path}','${namaClass}::${selectFunction}');`;
            if (!route_path) {
              vscode.window.showErrorMessage("Path route tidak boleh kosong");
            } else {
              fs.readFile(routes_path, "utf8", function (err, data) {
                if (err) {
                  console.log(err);
                  vscode.window.showErrorMessage("Gagal membaca file routes.php");
                } else {
                  const target_line = `$routes->get('/', 'Home::index');`;
                  const lines = data.split("\n");
                  const target_index = lines.findIndex((line) => line.includes(target_line));
                  if (target_index === -1) {
                    vscode.window.showErrorMessage("Tidak dapat menemukan baris target");
                    return;
                  }
                  lines.splice(target_index + 1, 0, new_route);
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
          });
        }
      });
    });
  }

  tambah();
}

module.exports = {
  tambah_route,
};
