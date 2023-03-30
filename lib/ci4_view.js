"use-strict";

const path = require("path");
const vscode = require("vscode");
const fs = require("fs");

const direktori_user = vscode.workspace.workspaceFolders[0].uri.path.substring(1, 1000);
const direktory_views = path.join(direktori_user, "app/Views/pages/");

function buat_views(apa) {
  const file_views = fs.createWriteStream(direktory_views + apa + ".php");

  let text_inner = `<?php
echo $this->extend('template');
echo $this->section('content') ?>

<!-- Code Views Here  -->


<?php echo $this->endSection() ?>`;

  file_views.write(text_inner, (err) => {
    if (err) {
      return;
    }
  });

  file_views.on("finish", (err) => {
    file_views.close();
  });
}

module.exports = {
  buat_views,
};
