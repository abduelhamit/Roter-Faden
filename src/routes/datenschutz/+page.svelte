<script lang="ts">
	import { resolve } from '$app/paths';
	import { PROVIDER } from '#lib/provider.js';
</script>

<svelte:head><title>Datenschutz – Roter Faden</title></svelte:head>

<!-- Every claim below was checked against the build rather than copied from a generator: the only
     storage API in use is localStorage (color mode, later game progress), any fetch stays on this
     site (the dictionary, once the game needs it), and every asset in the built HTML is
     same-origin. If that ever stops being true — an embedded video, an external web font, a
     counter — this page becomes wrong before anything else on the site does. -->
<main class="mx-auto w-full max-w-2xl space-y-md px-lg py-lg">
	<h1 class="text-lg font-semibold">Datenschutzerklärung</h1>

	<section>
		<h2 class="text-base font-semibold">Verantwortlicher</h2>
		<p class="mt-xs">
			Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:
		</p>
		<p class="mt-xs">
			{PROVIDER.name}<br />
			{#each PROVIDER.address as line, i (i)}{line}<br />{/each}
			E-Mail:
			<a class="text-fg-accent hover:underline" href="mailto:{PROVIDER.email}">{PROVIDER.email}</a>
		</p>
	</section>

	<section>
		<h2 class="text-base font-semibold">Was in Ihrem Browser geschieht</h2>
		<p class="mt-xs">
			Diese Website ist eine rein statische Seite. Sie setzt <strong>keine Cookies</strong>, sie
			bindet <strong>keine externen Schriftarten, Karten, Videos oder Skripte</strong> ein und sie
			verwendet <strong>keine Analyse- oder Tracking-Dienste</strong>. Es gibt kein Kontaktformular,
			keinen Newsletter und keine Benutzerkonten.
		</p>
		<p class="mt-xs">
			Das Spiel läuft vollständig in Ihrem Browser. Gespeichert wird dabei nur in Ihrem Browser
			selbst (<strong>localStorage</strong>) — etwa Ihre Farbeinstellung und, sobald es sie gibt,
			Spielstände. Diese Daten bleiben auf Ihrem Gerät und werden nie an uns oder Dritte
			übermittelt; Sie können sie jederzeit löschen, indem Sie die Daten dieser Website in Ihrem
			Browser entfernen. Auch das <strong>Wörterbuch</strong> lädt Ihr Browser ausschließlich von dieser
			Website nach, sobald das Spiel es braucht. Geteilte Rätsel stecken komplett im URL-Link und werden
			nur lokal dekodiert — was Sie öffnen, verlässt Ihr Gerät nicht.
		</p>
	</section>

	<section>
		<h2 class="text-base font-semibold">Hosting und Server-Logfiles</h2>
		<p class="mt-xs">
			Die Seite wird von <strong>GitHub Pages</strong> ausgeliefert, einem Dienst der GitHub, Inc.,
			88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Abruf einer Seite übermittelt
			Ihr Browser technisch notwendige Daten an GitHub, die dort in Server-Logfiles verarbeitet
			werden — insbesondere Ihre <strong>IP-Adresse</strong>, Datum und Uhrzeit des Abrufs, die
			angeforderte Datei sowie die übermittelte Browser- und Betriebssystemkennung.
		</p>
		<p class="mt-xs">
			Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der
			technisch fehlerfreien Auslieferung und der Sicherheit der Website; ohne die Übermittlung der
			IP-Adresse lässt sich eine Seite nicht ausliefern. Auf Umfang und Speicherdauer dieser
			Logfiles habe ich keinen Einfluss. Die Verarbeitung findet auch in den USA statt; Einzelheiten
			und die dortigen Garantien beschreibt GitHub in seiner
			<a
				class="text-fg-accent hover:underline"
				href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
			>
				Datenschutzerklärung</a
			>.
		</p>
	</section>

	<section>
		<h2 class="text-base font-semibold">Ihre Rechte</h2>
		<p class="mt-xs">
			Sie haben das Recht auf Auskunft über die zu Ihrer Person verarbeiteten Daten (Art. 15 DSGVO),
			auf Berichtigung (Art. 16), auf Löschung (Art. 17), auf Einschränkung der Verarbeitung (Art.
			18), auf Datenübertragbarkeit (Art. 20) sowie auf Widerspruch gegen eine Verarbeitung auf
			Grundlage berechtigter Interessen (Art. 21). Wenden Sie sich dafür an die oben genannte
			Adresse (Kontaktdaten siehe
			<a class="text-fg-accent hover:underline" href={resolve('/impressum')}>Impressum</a>).
		</p>
		<p class="mt-xs">
			Unabhängig davon steht Ihnen ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu
			(Art. 77 DSGVO), insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts oder des mutmaßlichen
			Verstoßes.
		</p>
	</section>

	<section>
		<h2 class="text-base font-semibold">Keine Weitergabe, keine automatisierten Entscheidungen</h2>
		<p class="mt-xs">
			Über das oben beschriebene Hosting hinaus werden keine personenbezogenen Daten an Dritte
			weitergegeben. Eine automatisierte Entscheidungsfindung einschließlich Profiling nach Art. 22
			DSGVO findet nicht statt.
		</p>
	</section>
</main>
