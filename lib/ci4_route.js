const vscode = require("vscode");
const path = require("path");
const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);

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

module.exports = {
  tambah_route,
};
