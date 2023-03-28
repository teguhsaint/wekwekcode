const vscode = require("vscode");
const mysql = require("mysql");

function get_set() {
  const myset = vscode.workspace.getConfiguration("wekwekcode");

  // membuat koneksi ke database
  const connection = mysql.createConnection({
    host: myset.get("mysqlhost"),
    user: myset.get("mysqlusername"),
    password: myset.get("mysqlpassword"),
    database: "",
  });
  connection.query("SHOW DATABASES", (error, results, fields) => {
    if (error) {
      console.error(error);
    } else {
      const items = results.map((result) => result.Database);
      vscode.window.showQuickPick(items).then((selectedItem) => {
        if (selectedItem) {
          // menggunakan database yang dipilih
          connection.changeUser({ database: selectedItem }, (error) => {
            if (error) {
              console.error(error);
            } else {
              // menjalankan query SQL untuk menampilkan daftar tabel
              connection.query("SHOW TABLES", (error, results2, fields) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log("Daftar tabel:");
                  const tables = results2.map((result2) => result2["Tables_in_" + selectedItem]);
                  vscode.window.showQuickPick(tables).then((selectedTables) => {
                    if (selectedTables) {
                      console.log(`Tabel yang dipilih: ${selectedTables}`);
                    } else {
                      console.log("Tidak ada tabel yang dipilih");
                    }
                  });
                }
                connection.end();
              });
            }
          });
        }
      });
    }
  });
}
module.exports = {
  get_set,
};
