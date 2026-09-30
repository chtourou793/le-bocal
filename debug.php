<?php
require_once __DIR__."/admin/guard.php";

echo "<h2>Dossier utilisé par Apache :</h2>";
echo __DIR__;

echo "<h2>Chemin du CSS :</h2>";
echo realpath("style.css");

echo "<h2>Dernière modification :</h2>";
echo date("d/m/Y H:i:s", filemtime("style.css"));

echo "<h2>Fin du fichier style.css :</h2>";
echo "<pre>";
echo htmlspecialchars(substr(file_get_contents("style.css"), -1000));
echo "</pre>";