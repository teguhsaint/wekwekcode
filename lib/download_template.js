const vscode = require("vscode");
const path = require("path");
const https = require("https");
const fs = require("fs");
const decompress = require("decompress");
const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);

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

module.exports = {
  download_template_func,
};
