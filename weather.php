<?php
require_once __DIR__.'/includes/weather.php';header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');
try{
 if($_SERVER['REQUEST_METHOD']!=='GET'){header('Allow: GET');http_response_code(405);throw new InvalidArgumentException('Méthode non autorisée.');}
 $date=is_string($_GET['date']??null)?$_GET['date']:'';$time=is_string($_GET['time']??null)?$_GET['time']:'';[$start]=bocalSlot($date,$time);
 $at=new DateTimeImmutable($start);
 // Aucun appel distant pour une date hors de l'horizon des prévisions.
 $cache=$at>(new DateTimeImmutable())->modify('+10 days')?[]:bocalWeatherData();echo json_encode(bocalWeatherSelect($cache,$at),JSON_UNESCAPED_UNICODE);
}catch(Throwable $e){if(http_response_code()!==405)http_response_code($e instanceof InvalidArgumentException?400:503);echo json_encode(['error'=>$e instanceof InvalidArgumentException?$e->getMessage():'Météo momentanément indisponible.'],JSON_UNESCAPED_UNICODE);}
