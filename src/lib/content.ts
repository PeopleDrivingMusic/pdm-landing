import type { Audience } from './stores/audience.svelte';

export const hero: Record<Audience, { kicker: string; heading: string[]; sub: string }> = {
	fan: {
		kicker: 'People Driven Music',
		heading: ['Stop streaming.', 'Start belonging.'],
		sub: 'Back the artists you love for $1 a month. Unlock exclusive drops, private community, and a real say.'
	},
	artist: {
		kicker: 'People Driven Music',
		heading: ["Don't chase streams.", 'Build real fans.'],
		sub: 'Turn listeners into paying superfans. Direct income, your own community, and the tools to grow it.'
	}
};

export const heroBadge = 'Early access · waitlist open';

/** Hero cross-link that flips the page to the other perspective. The key is the
 *  audience currently being shown; the copy offers the opposite side. */
export const audienceSwitch: Record<Audience, { prompt: string; action: string }> = {
	fan: { prompt: 'Making music?', action: 'See the artist side' },
	artist: { prompt: 'Just here to listen?', action: 'See the fan side' }
};

export const heroPerks: Record<Audience, { title: string; items: string[] }> = {
	fan: {
		title: 'Paid subscription unlocks',
		items: ['Exclusive content', 'Fanbase community chat', 'Early access to presales']
	},
	artist: {
		title: 'Your artist toolkit',
		items: ['Direct fan income', 'Your community & feed', 'Presales, merch & tickets']
	}
};

/** The pains, sharpened per audience. */
export const problem: Record<
	Audience,
	{ kicker: string; heading: string; pains: string[]; close: string }
> = {
	fan: {
		kicker: 'The reality',
		heading: 'Loving the music has never felt this far from the artist.',
		pains: [
			'You follow one artist across five apps: music here, videos there, life everywhere.',
			'You pay for a subscription and get little back but fewer ads, while your favourite artists earn fractions of a cent.',
			'Bots and scalpers grab the tickets in seconds, then sell them back to you at a markup.'
		],
		close: 'You love the music. You just never get close to the people making it.'
	},
	artist: {
		kicker: 'The reality',
		heading: 'You are fighting an algorithm to reach your own fans.',
		pains: [
			'AI is flooding streaming, and no real artist can out-produce a machine.',
			'A play is not a fan. Volume will never equal loyalty.',
			'Your fans pay a subscription, but part of that money goes to artists they never even listen to.',
			'You have no real tool to actually work with your fanbase.',
			'The connection between artist and fan is almost gone.'
		],
		close: 'You built the fans. The platform keeps them.'
	}
};

/** The shift: from transaction to belonging, per audience. */
export const shift: Record<
	Audience,
	{
		kicker: string;
		heading: string;
		body: string;
		points?: { title: string; note: string }[];
		versus?: { a: string; b: string };
	}
> = {
	fan: {
		kicker: 'The shift',
		heading: 'Get closer than a stream ever could.',
		body: 'Back your favourite artist and get far more than streaming gives you. Step inside their fanbase: exclusive content, a private community chat, and a real seat at the table.',
		points: [
			{ title: 'Exclusive drops', note: 'Demos and posts before anyone else hears them.' },
			{ title: 'Private community', note: 'A members-only chat with the artist and fans.' },
			{ title: 'A real say', note: 'Help shape covers, artwork and what comes next.' }
		]
	},
	artist: {
		kicker: 'The shift',
		heading: 'One loyal fan beats a thousand plays.',
		body: 'Ten true fans are worth more than thousands of hollow streams. Build that bond through exclusive drops and real conversation. You are more than just the music.',
		versus: { a: '10 loyal fans', b: '3,000 anonymous plays' }
	}
};

/** How it works, per audience. The only place the $1 / 80% split is spelled out. */
export const steps: Record<Audience, { n: number; title: string; desc: string }[]> = {
	fan: [
		{ n: 1, title: 'Listen for free', desc: 'Stream music and explore everything, no charge.' },
		{
			n: 2,
			title: 'Back an artist for $1',
			desc: 'Want exclusives, ticket discounts and the community chat? Pay $1. 80% goes to the artist, 20% keeps the ecosystem running.'
		},
		{
			n: 3,
			title: 'Get closer',
			desc: 'Unlock drops, join the chat, and grow alongside the artist.'
		}
	],
	artist: [
		{
			n: 1,
			title: 'Open your space',
			desc: 'Share posts and exclusives. You decide what is public and what is subscriber-only.'
		},
		{
			n: 2,
			title: 'Earn loyalty, not plays',
			desc: 'Turn listeners into paying fans whose loyalty is worth far more than a stream.'
		},
		{
			n: 3,
			title: 'Grow with your fans',
			desc: 'A feed, a community and a store, all yours. You are more than music.'
		}
	]
};

/** Section intro for the unlock bento, per audience. */
export const benefitsIntro: Record<Audience, { kicker: string; heading: string }> = {
	fan: { kicker: 'What you unlock', heading: 'Just $1, and you unlock.' },
	artist: { kicker: 'Your toolkit', heading: 'Everything to build your fanbase.' }
};

export const benefits: Record<Audience, { title: string; desc: string }[]> = {
	fan: [
		{
			title: 'Exclusive drops',
			desc: 'Private posts, demos and behind-the-scenes from the artist.'
		},
		{ title: 'Ad-free listening', desc: 'Zero ads on everything that artist makes.' },
		{ title: 'Offline mode', desc: 'Cache their tracks and listen anywhere, anytime.' },
		{ title: 'Presale access', desc: 'First in line for tickets, before the bots.' },
		{
			title: 'Community & comments',
			desc: 'A paid-only chat with the artist, plus your voice on every track.'
		}
	],
	artist: [
		{ title: 'Direct income', desc: 'Subscriptions land in your account and pay out fast.' },
		{ title: 'Your community', desc: 'A private space to talk to the fans who fund you.' },
		{ title: 'Feed & store', desc: 'Post exclusives, sell merch and tickets, your way.' },
		{ title: 'Fan analytics', desc: 'See where your paying fans are and plan tours around them.' },
		{ title: 'You decide', desc: 'Choose what is free for everyone and what is subscriber-only.' }
	]
};

/** Stub copy for the membership-pass treatment of the unlock section. */
export const unlockPass: Record<Audience, { big: string; unit: string; label: string }> = {
	fan: { big: '$1', unit: 'per month', label: 'Fan Pass' },
	artist: { big: '80%', unit: 'goes to you', label: 'Artist Pass' }
};

/** Referral programme. */
export const referral = {
	kicker: 'Bring your people',
	heading: 'And that is not even all of it.',
	body: 'Refer a friend and earn a slice of our commission, for life. Early members earn the most.',
	rateDefault: '10%',
	rateEarly: '15%',
	note: 'Join the waitlist to get your referral link. Early-access members lock in 15%.'
};

/** Role-aware qualifying dropdown shown in the waitlist form. */
export const waitlistScale: Record<
	Audience,
	{ label: string; placeholder: string; options: { value: string; label: string }[] }
> = {
	fan: {
		label: 'How many artists would you back?',
		placeholder: 'Choose one (optional)',
		options: [
			{ value: '0', label: 'Just exploring for now' },
			{ value: '1', label: '1 artist' },
			{ value: '3-5', label: '3 to 5 artists' },
			{ value: '5+', label: 'More than 5' }
		]
	},
	artist: {
		label: 'How big is your fanbase?',
		placeholder: 'Choose one (optional)',
		options: [
			{ value: 'under-1k', label: 'Just starting out (under 1,000)' },
			{ value: '1k-10k', label: '1,000 to 10,000' },
			{ value: '10k-100k', label: '10,000 to 100,000' },
			{ value: '100k+', label: 'Over 100,000' }
		]
	}
};

/** FAQ content. Kept in sync with the FAQPage JSON-LD in SEO.svelte. */
export const faq: { q: string; a: string }[] = [
	{
		q: 'What is PDM?',
		a: 'PDM (People Driven Music) is a music platform where fans back the artists they love directly. You subscribe to a specific artist for $1 a month, and 80% of that goes straight to them.'
	},
	{
		q: 'Is it free to listen?',
		a: 'Yes. You can stream music and discover new artists for free. You only pay when you choose to back an artist for $1 a month to unlock extras like higher quality, comments and offline listening.'
	},
	{
		q: 'Where does my $1 go?',
		a: '80% goes directly to the artist you back. The remaining 20% keeps PDM running. No label cut and no algorithm tax in between.'
	},
	{
		q: 'What do I get for $1 a month?',
		a: 'Exclusive posts and demos, a paid-only community chat with the artist, the ability to comment, offline caching, ad-free playback for that artist, and early access to presales for tickets and merch.'
	},
	{
		q: 'I am an artist. How do I earn?',
		a: 'Subscriptions land in your account and pay out fast. You also get your own feed, community and store for merch and tickets, plus analytics showing where your paying fans are.'
	},
	{
		q: 'How does the referral programme work?',
		a: 'After you join the waitlist you get a personal referral link. Share it, and when someone you referred backs an artist you earn a share of our commission, for life. Early-access members lock in a higher rate.'
	},
	{
		q: 'When does PDM launch?',
		a: 'We are building PDM with our first fans and artists right now. Join the waitlist for early access and founding-member perks.'
	}
];
