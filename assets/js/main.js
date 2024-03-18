(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}


	
	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);



document.addEventListener('DOMContentLoaded', function() {
// Auswahl der Elemente
	var logoContainer = document.querySelector('.logo-container');
	var logo = document.querySelector('.logo.spinAndShadow');
	var logoShadow = document.querySelector('.logo-shadow'); // Hinzufügen des Schattenelements
	var isSpinning = false;
	var confirmBoxShown = false;
	var logoClickListenerAdded = false;
	var animationInProgress = true;
	var clickCount = 0;
	var hintStar = document.querySelector('.hint-star');
	var newLogo = document.querySelector('.new-logo'); // Ziel für finalen Wobble



		// Bestätigungsdialog-Elemente und -Logik
		var confirmBox = document.getElementById('customConfirmBox');
		var confirmYes = document.getElementById('confirmYes');
		var confirmNo = document.getElementById('confirmNo');




		//Bildergallerie

		let currentIndex = 0; // Startindex
    const images = [
        "images/nikotin.png",
		"images/kueche.png",
        "images/muelleimer.png",
        "images/heizung.png",
		"images/ofen.png",
		"images/ofen_aussen.png",
		"images/kueche_ofen.png"


		  	// Stelle sicher, dass alle Pfade korrekt sind
    ];



	function changeImage(direction) {
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = images.length - 1; // Gehe zum letzten Bild, wenn der Index unter 0 fällt
        } else if (currentIndex >= images.length) {
            currentIndex = 0; // Gehe zum ersten Bild, wenn der Index über die Anzahl der Bilder hinausgeht
        }
        document.getElementById("current-image").src = images[currentIndex];
    }

	changeImage(currentIndex);


    // Verknüpfung der Funktion mit den Buttons
    document.querySelector('.prev').addEventListener('click', function() { changeImage(-1); });
    document.querySelector('.next').addEventListener('click', function() { changeImage(1); });


		//Bildergallerie ende




		// Startet die Fall-Animation sofort
		newLogo.style.animation = 'fall 2.5s cubic-bezier(0.3, 0, 0.8, 0) forwards';
			

		newLogo.addEventListener('animationend', function(e) {
			if (e.animationName === 'fall') {
				// Startet die Tilt-Animation direkt nach dem Ende der Fall-Animation
				newLogo.style.animation = 'tilt 1s forwards';
			} else if (e.animationName === 'tilt') {
				// Startet die Wobble-Animation direkt nach dem Ende der Tilt-Animation
				newLogo.style.animation = 'wobble 3s cubic-bezier(0.001, 0, 1, 0) forwards';
			} else if (e.animationName === 'wobble') {startFinalWobble();
			}
			// finalWobble wird basierend auf einer gesetzten Verzögerung oder im Anschluss an wobble gestartet
		}, { once: false });



		function startFinalWobble() {
			newLogo.style.animation = 'none'; // Reset der Animation
			void newLogo.offsetWidth; // Trigger reflow für Neustart der Animation
			newLogo.style.transformOrigin = '50% 50%'; // Setzt den Drehpunkt auf die Mitte des Logos
			newLogo.style.animation = 'finalWobble 0.5s forwards';
		}






		window.addEventListener('load', function() {
		//starten der schattenanimation beim laden der seite
		logo.classList.add('spinAndShadow');
		logoShadow.style.animation = 'shadowSpin 3s linear 1';
		// Warte eine bestimmte Zeit nach dem Laden der Seite
		setTimeout(function() {
		// Setze animationInProgress auf false, um Interaktionen zu ermöglichen
		animationInProgress = false;
		}, 3000); // Hier können Sie die Verzögerung anpassen
		});




				
						// Event Listener für den Bestätigungsdialog
						confirmYes.addEventListener('click', function() {
						window.location.href = '#anmelden';
						confirmBox.style.display = 'none';
						});

						confirmNo.addEventListener('click', function() {
						confirmBox.style.display = 'none';
						});

						// Funktion zum Anzeigen des Bestätigungsdialogs
						function showConfirmBox() {
						if (!confirmBoxShown) {
							setTimeout(function() {
								confirmBox.style.display = 'block';
								confirmBoxShown = true;
							}, 3500);
							}
							}	



						// Funktion zum Beenden der Logo-Drehanimation
						function handleAnimationEnd() {
						logoContainer.style.transition = 'transform 1s ease';
						logoContainer.style.transform = 'scale(1)';
						logo.classList.remove('spinAndShadow');
						isSpinning = false;
						logo.removeEventListener('animationend', handleAnimationEnd);
						animationInProgress = false;
						logoShadow.style.animation = 'none'; // Stoppt Schatten-Animation
						}



						// Funktion zum Starten der Logo-Drehanimation
						function toggleSpin() {
						console.log("Toggle Spin aufgerufen");



						if (!isSpinning) {
						// Animation starten
						animationInProgress = true;
						logo.classList.remove('spinAndShadow');
						void logo.offsetWidth; // Trigger reflow für Neustart der Animation
						logo.classList.add('spinAndShadow');
						logoShadow.style.animation = 'shadowSpin 3s linear 1'; // Schatten-Animation starten
						isSpinning = true;
						}
						}
					
				
				



				// Event Listener für das Ende der Logo-Animation
				logo.addEventListener('animationend', function() {
					// Beendet die Schatten-Animation, wenn die Logo-Animation endet
					logoShadow.style.animation = 'none';
					isSpinning = false;
					animationInProgress = false;
					logo.classList.remove('spinAndShadow');
				});



			
				if (!logoClickListenerAdded) {
					logo.addEventListener('click', function() {
					// Überprüfung, ob keine andere Animation im Gange ist
					if (!animationInProgress) {
						toggleSpin();
						// Zählt nur, wenn keine andere Animation läuft
						clickCount++;
					}


			

					// Logik für die Bestätigungsbox nach dem zweiten Klick
					if (clickCount === 1 && !confirmBoxShown) {
						showConfirmBox();
					}
				});


				logoClickListenerAdded = true; // Listener als hinzugefügt markieren
				}


			

			
				// Funktionen für das Sternchen-Element
				function showHintStar() {
					hintStar.style.display = 'block';
				}

				function hideHintStar() {
					hintStar.style.display = 'none';
				}

				// Aufruf der initialen Funktionen oder Einstellungen
				// ...

				



				
});

