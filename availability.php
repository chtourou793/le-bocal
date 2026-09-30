<?php
require_once __DIR__.'/includes/tables.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');
try {
    if ($_SERVER['REQUEST_METHOD']!=='GET') {http_response_code(405);header('Allow: GET');throw new InvalidArgumentException('Méthode non autorisée.');}
    $date=is_string($_GET['date']??null)?$_GET['date']:'';$time=is_string($_GET['time']??null)?$_GET['time']:'';
    $people=filter_var($_GET['people']??2,FILTER_VALIDATE_INT);
    if ($people===false || $people<1 || $people>30) throw new InvalidArgumentException('Vérifiez le nombre de personnes.');
    [$start,$end]=bocalSlot($date,$time);
    require __DIR__.'/includes/db.php';bocalTablesEnsure($pdo);
    echo json_encode(bocalTableAvailability($pdo,$start,$end,$people),JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (http_response_code()!==405) http_response_code($e instanceof InvalidArgumentException?400:503);
    echo json_encode(['error'=>$e instanceof InvalidArgumentException?$e->getMessage():'Disponibilités momentanément indisponibles. Appelez le 03 29 75 95 50.'],JSON_UNESCAPED_UNICODE);
}
