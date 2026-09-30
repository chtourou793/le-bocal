<?php
require_once __DIR__.'/includes/chatbot-session.php';
require_once __DIR__.'/includes/chatbot-ai.php';
require_once __DIR__.'/includes/rate-limit.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function chatJson(array $data,int $status=200): void {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
$config=bocalAiConfig();
if ($_SERVER['REQUEST_METHOD']==='GET') chatJson(['enabled'=>$config['key']!=='','csrf'=>$_SESSION['csrf_token'],'history'=>(($_SESSION['bocal_chat']['updated']??0)>time()-1800 ? ($_SESSION['bocal_chat']['messages']??[]) : [])]);
if ($_SERVER['REQUEST_METHOD']!=='POST') {header('Allow: GET, POST');chatJson(['error'=>'Méthode non autorisée.'],405);}
$raw=file_get_contents('php://input',false,null,0,4097);
$data=strlen($raw)<=4096?json_decode($raw,true):null;
if (!is_array($data)||!is_string($data['csrf']??null)||!hash_equals($_SESSION['csrf_token'],$data['csrf'])) chatJson(['error'=>'La session a expiré. Fermez puis rouvrez le chat.'],403);
if (($data['action']??'')==='reset') {unset($_SESSION['bocal_chat']);chatJson(['ok'=>true]);}
$message=is_string($data['message']??null)?trim($data['message']):'';
if ($message===''||strlen($message)>3200||preg_match_all('/./us',$message)>800) chatJson(['error'=>'Écrivez une question courte (800 caractères maximum).'],400);
if ($config['key']==='') chatJson(['error'=>'L’assistant IA n’est pas encore activé. Vous pouvez consulter la carte, réserver ou appeler l’équipe.'],503);
$now=time();
$rate=$_SESSION['chat_rate']??['start'=>$now,'count'=>0,'last'=>0];
if ($now-$rate['start']>=3600) $rate=['start'=>$now,'count'=>0,'last'=>0];
if ($rate['count']>=30||$now-$rate['last']<3) chatJson(['error'=>'Merci de patienter avant une nouvelle question. Pour une demande urgente, appelez l’équipe.'],429);
$rate['count']++;$rate['last']=$now;$_SESSION['chat_rate']=$rate;
$history=($_SESSION['bocal_chat']['updated']??0)>$now-1800?($_SESSION['bocal_chat']['messages']??[]):[];
try {
    if (preg_match('/(.)\1{24,}/us',$message) || substr_count($message,'http')>3) chatJson(['error'=>'Écrivez une question sur Le Bocal sans texte répété.'],400);
    $fingerprint=hash('sha256',$message);
    if(($_SESSION['chat_duplicate']['hash']??'')===$fingerprint && $now-($_SESSION['chat_duplicate']['at']??0)<30)chatJson(['error'=>'Cette question vient d’être envoyée. Patientez un instant.'],429);
    if(!bocalRateTake('chat',[60=>6,3600=>40,86400=>100])){header('Retry-After: 60');chatJson(['error'=>'Vous avez envoyé plusieurs questions rapidement. Patientez un peu, ou appelez l’équipe.'],429);}
    $_SESSION['chat_duplicate']=['hash'=>$fingerprint,'at'=>$now];
    if(function_exists('set_time_limit'))@set_time_limit(50);
    $payload=bocalAiPayload($message,$history,$config);
    $text=bocalAiReply($payload,$config);
    $history[]=['role'=>'user','content'=>$message];$history[]=['role'=>'assistant','content'=>$text];
    $_SESSION['bocal_chat']=['updated'=>$now,'messages'=>array_slice($history,-12)];
    chatJson(['text'=>$text]);
} catch (Throwable $e) {
    error_log('Le Bocal chat: '.$e->getMessage());

    if ($e->getCode() === 429) {
        chatJson([
            'error' => 'Le quota gratuit est momentanément atteint. Réessayez plus tard.'
        ], 429);
    }

    chatJson([
        'error' => 'L’assistant est momentanément indisponible. Réessayez plus tard ou appelez le 03 29 75 95 50.'
    ], 503);
}
