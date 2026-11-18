// Dit bestand vervangt +page.server.js uit SvelteKit.
// Belangrijk verschil: deze code draait 1 keer tijdens de BUILD, niet bij elke bezoeker.
// Wat hier wordt teruggegeven is in elke template beschikbaar als "snappmaps".

const directusUrl = 'https://fdnd-agency.directus.app';

// Hardcoded user (Anne-Fleur Pietersen), net als in de SvelteKit-versie
const userUuid = '5e9589a5-ebfa-4a99-87a6-010f2f571444';

export default async function () {
	const params = new URLSearchParams();
	params.set('fields', '*,snaps.*');
	params.set('sort', '-time_end');
	params.set('deep[snaps][_sort]', '-date_created');

	const response = await fetch(`${directusUrl}/items/snappthis_snapmap?${params}`);

	// Er is geen server die een foutpagina kan tonen, dus de build stopt met een duidelijke melding
	if (!response.ok) {
		throw new Error(`Directus gaf status ${response.status}, de snappmaps konden niet geladen worden.`);
	}

	const { data } = await response.json();

	// Let op: "nu" is het moment van builden, niet het moment dat iemand de site bezoekt
	const now = new Date();

	const snappmaps = data.map((snappmap) => {
		const snaps = snappmap.snaps ?? [];
		const userHasSnapp = snaps.some((snap) => snap.author === userUuid);
		const isActive = new Date(snappmap.time_end) > now;

		return {
			uuid: snappmap.uuid,
			slug: snappmap.slug,
			name: snappmap.name,
			timeEnd: snappmap.time_end,
			userHasSnapp,
			showAddSnapp: isActive && userHasSnapp,
			thumbnails: snaps.slice(0, 5).map((snap) => ({
				uuid: snap.uuid,
				picture: snap.picture
			}))
		};
	});

	// Snappmaps met een snapp van de user eerst, daarna op einddatum (nieuwste eerst)
	snappmaps.sort((a, b) => {
		if (a.userHasSnapp && !b.userHasSnapp) return -1;
		if (!a.userHasSnapp && b.userHasSnapp) return 1;
		return new Date(b.timeEnd) - new Date(a.timeEnd);
	});

	return snappmaps;
}