<?php
require_once __DIR__.'/includes/events.php';
$events=[];$eventsError=false;
try {require __DIR__.'/includes/db.php';bocalEventsEnsure($pdo);$events=bocalEventsPublic($pdo);}catch(Throwable $e){$eventsError=true;}
$pageTitle='Les événements | Le Bocal';require __DIR__.'/includes/header.php';
$now=date('Y-m-d H:i:s');
$upcoming=array_values(array_filter($events,static fn($e)=>$e['end_at']>=$now));usort($upcoming,static fn($a,$b)=>strcmp($a['start_at'],$b['start_at']));
$past=array_filter($events,static fn($e)=>$e['end_at']<$now);
?>
<main class="events-page" id="top-events"><header class="editorial-intro"><p class="eyebrow">LA VIE DU BISTROT</p><h1>De beaux moments.<br><em>À partager.</em></h1><p>Les prochains rendez-vous et les souvenirs du Bocal.</p><div class="event-tabs"><a href="#a-venir">À venir <span><?= count($upcoming) ?></span></a><a href="#passes">Les souvenirs <span><?= count($past) ?></span></a></div></header>
<?php if($eventsError): ?><p class="event-empty" role="status">Les événements sont momentanément indisponibles. Revenez dans un instant.</p><?php else: ?>
<section class="event-section" id="a-venir"><div class="event-heading"><p class="eyebrow">À NOTER DANS L’AGENDA</p><h2>Nos prochains rendez-vous</h2></div><div class="events-grid"><?php foreach($upcoming as $e) bocalEventCard($e); ?></div><?php if(!$upcoming):?><p class="event-empty">De nouveaux rendez-vous arrivent bientôt. En attendant, on se retrouve au Bocal.</p><?php endif;?></section>
<section class="event-section" id="passes"><div class="event-heading"><p class="eyebrow">C’ÉTAIT AU BOCAL</p><h2>Les bons souvenirs restent.</h2></div><div class="events-grid"><?php foreach($past as $e) bocalEventCard($e); ?></div><?php if(!$past):?><p class="event-empty">Les souvenirs de nos événements seront partagés ici.</p><?php endif;?></section><?php endif; ?></main>
<?php require __DIR__.'/includes/footer.php'; ?>
