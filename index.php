<?php header("Cache-Control: no-store"); include "includes/header.php"; ?>

<main id="accueil">

  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-left">
      <p class="eyebrow hero-eyebrow"><span></span>BISTROT · BAR-LE-DUC</p>

      <h1 id="hero-title">On se retrouve<br>au <em>Bocal.</em></h1>

      <p class="hero-copy">Un verre, une table, une conversation.<br>Les bons moments, tout simplement.</p>

      <div class="hero-actions">
        <a href="#carte" class="cream-button">Découvrir la carte <span>↗</span></a>
        <a class="text-button" href="reservation.php">Réserver une table <span>→</span></a>
      </div>

      <p class="hero-address"><span class="pin" aria-hidden="true">⌖</span>3 rue du Four, Bar-le-Duc</p>
    </div>

    <div class="hero-right">
      <img src="images/facade.jpeg" alt="Façade du bistrot Le Bocal à Bar-le-Duc">
      <a class="door-label" href="#infos">LA PORTE EST JUSTE ICI <span>↗</span></a>
    </div>
  </section>

  <section class="place" id="lieu" aria-labelledby="place-title">
    <div class="place-intro">
      <div>
        <p class="eyebrow">L’ESPRIT DU LIEU</p>
        <h2 id="place-title">Poussez la porte.<br><em>Prenez le temps.</em></h2>
      </div>

      <div class="place-description">
        <p>Du bois, des plantes, de grandes fenêtres sur la place. Au Bocal, on s’installe au comptoir ou autour d’une table, pour une pause et le plaisir de se retrouver.</p>
        <a class="underline-link" href="#infos">Préparer votre visite <span>↗</span></a>
      </div>
    </div>

    <div class="gallery">
      <figure>
        <div class="photo-wrap"><img src="images/facade copy.jpeg" alt="Un coin au soleil au Bocal" loading="lazy"></div>
        <figcaption><span>Un coin au soleil</span><span>↗</span></figcaption>
      </figure>
      <figure>
        <div class="photo-wrap"><img src="images/facade copy 5.jpeg" alt="Vue sur la place depuis Le Bocal" loading="lazy"></div>
        <figcaption><span>La place en panorama</span><span>↗</span></figcaption>
      </figure>
      <figure>
        <div class="photo-wrap"><img src="images/facade copy 4.jpeg" alt="Tables à l'intérieur du Bocal" loading="lazy"></div>
        <figcaption><span>À votre table</span><span>↗</span></figcaption>
      </figure>
      <figure>
        <div class="photo-wrap"><img src="images/facade copy 3.jpeg" alt="Le comptoir du Bocal" loading="lazy"></div>
        <figcaption><span>Du côté du comptoir</span><span>↗</span></figcaption>
      </figure>
    </div>
  </section>

  <?php require_once __DIR__.'/includes/menu.php'; echo bocalMenuRender(); ?>

  <section class="home-events" id="evenements"><div class="event-heading"><div><p class="eyebrow">LES RENDEZ-VOUS DU BOCAL</p><h2>Il se passe toujours<br><em>quelque chose ici.</em></h2></div><a class="underline-link" href="evenements.php">Tous les événements <span>↗</span></a></div>
  <?php require_once __DIR__.'/includes/events.php';$homeEvents=[];$eventFailure=false;try{require __DIR__.'/includes/db.php';bocalEventsEnsure($pdo);$allEvents=bocalEventsPublic($pdo);$future=array_filter($allEvents,static fn($e)=>$e['end_at']>=date('Y-m-d H:i:s'));usort($future,static fn($a,$b)=>strcmp($a['start_at'],$b['start_at']));$past=array_filter($allEvents,static fn($e)=>$e['end_at']<date('Y-m-d H:i:s'));$homeEvents=array_slice(array_merge($future,$past),0,3);}catch(Throwable $e){$eventFailure=true;} ?>
  <div class="events-grid"><?php foreach($homeEvents as $e)bocalEventCard($e);?></div><?php if(!$homeEvents):?><p class="event-empty"><?= $eventFailure?'Les événements sont momentanément indisponibles. Revenez dans un instant.':'Nos prochains rendez-vous seront annoncés ici. Le plaisir de se retrouver, lui, n’attend pas.' ?></p><?php endif;?></section>
  <section class="visit" id="infos" aria-labelledby="visit-title">
    <div class="visit-inner">
      <div class="visit-heading">
        <p class="eyebrow accent">ON VOUS GARDE UNE PLACE DANS LA CONVERSATION</p>
        <h2 id="visit-title">À bientôt <em>au Bocal.</em></h2>
        <p>Toutes les informations pour préparer votre venue.</p>
      </div>

      <div class="visit-grid">
        <div class="address-card">
          <p class="eyebrow accent">01 — NOUS TROUVER</p>
          <h3>Au cœur<br>de Bar-le-Duc.</h3>
          <p class="address">3 rue du Four<br>55000 Bar-le-Duc</p>
          <a class="direction-button" href="https://www.google.com/maps/search/?api=1&query=3+rue+du+Four+Bar-le-Duc" target="_blank" rel="noopener">Ouvrir l’itinéraire <span>↗</span></a>
          <button id="copyAddress" class="copy-button" type="button">Copier l’adresse <span>▢</span></button>
        </div>

        <div class="visit-details">
          <div class="visit-detail">
            <p class="eyebrow accent">02 — UN COUP DE FIL</p>
            <a class="phone" href="tel:+33329759550">03 29 75 95 50 <span>↗</span></a>
            <p>Une table, un groupe, une question ?<br>Les demandes se font directement par téléphone.</p>
            <a class="underline-link light" href="le-bocal.vcf" download>Enregistrer le contact <span>↓</span></a>
          </div>

          <div class="visit-detail">
            <p class="eyebrow accent">03 — LES HORAIRES</p>
            <h3>Avant de passer...</h3>
            <p>Les horaires actualisés restent à confirmer. Un appel au bistrot vous permettra de vérifier l’ouverture et le service du jour.</p>
            <a class="underline-link light" href="tel:+33329759550">Vérifier par téléphone <span>↗</span></a>
          </div>
        </div>
      </div>

      <div class="faq">
        <div class="faq-item">
          <button class="faq-question" type="button" aria-expanded="false">Comment réserver une table ? <span>+</span></button>
          <div class="faq-answer">
            <p>Pour le moment, les réservations se font directement par téléphone au 03 29 75 95 50.</p>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question" type="button" aria-expanded="false">Une allergie ou une demande particulière ? <span>+</span></button>
          <div class="faq-answer">
            <p>Contactez directement l’équipe avant votre venue afin de vérifier les possibilités.</p>
          </div>
        </div>
        <div class="faq-item">
          <button class="faq-question" type="button" aria-expanded="false">À propos de cette version du site <span>+</span></button>
          <div class="faq-answer">
            <p>Cette version du site est actuellement en cours de développement.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<?php include "includes/footer.php"; ?>