const vscode = require("vscode");
const path = require("path");
const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);
const fs = require("fs");

function cicontroller_func() {
  const dir_controller = path.join(direktori_user, "app/Controllers/");

  async function hh() {
    const nama_file = await vscode.window.showInputBox({ placeHolder: "contoh : CtrPelanggan", title: "Nama File Controller tanpa .php tidak boleh ada spasi" });
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

module.exports = {
  cicontroller_func,
};
