import type {
	Pet,
	WalkRequest,
	WalkerProfile,
	WalkRecord,
	WalkStatus,
	ManagedPaymentMethod,
	PaymentHistoryItem,
	WalkReview,
	WalkerCertDocument,
	ClientStats,
	WalkerStats,
	DocumentsStatus,
	WalkLocation,
	WalkerBankAccount,
	WalkerPublicReview,
} from '@/types';

export const pets: Pet[] = [
	{ id: '1', ownerId: 'client_1', name: 'Rex',  breed: 'Golden Retriever', age: 3, size: 'large',  gender: 'male',   notes: 'Brincalhao e docil.' },
	{ id: '2', ownerId: 'client_1', name: 'Mel',  breed: 'Poodle',           age: 1, size: 'small',  gender: 'female', notes: 'Agitada, puxa a coleira nos primeiros 5 minutos.' },
	{ id: '3', ownerId: 'client_4', name: 'Thor', breed: 'Labrador',         age: 2, size: 'large',  gender: 'male' },
	{ id: '4', ownerId: 'client_5', name: 'Bolt', breed: 'Border Collie',    age: 4, size: 'medium', gender: 'male' },
	{ id: '5', ownerId: 'client_5', name: 'Nina', breed: 'Shih Tzu',         age: 6, size: 'small',  gender: 'female' },
];

export const walkRequests: WalkRequest[] = [
	{
		id: 'req-1',
		clientId: 'client_2',
		clientName: 'Ana Silva',
		clientAvatarUrl: null,
		petNames: ['Rex'],
		petIds: ['pet_2'],
		petPhotos: [{ id: 'pet_2', photoUrl: null }],
		durationMinutes: 30,
		price: 44,
		scheduledAt: '2026-05-21T15:00:00-03:00',
		scheduledLabel: 'Hoje às 15:00',
		startAddress: 'Rua das Flores, 120 - São Paulo',
		receivedMinutes: 3,
	},
	{
		id: 'req-2',
		clientId: 'client_3',
		clientName: 'Julia Mendes',
		clientAvatarUrl: null,
		petNames: ['Mel', 'Bob'],
		petIds: ['pet_3', 'pet_4'],
		petPhotos: [{ id: 'pet_3', photoUrl: null }, { id: 'pet_4', photoUrl: null }],
		durationMinutes: 45,
		price: 58,
		scheduledAt: '2026-05-22T09:00:00-03:00',
		scheduledLabel: 'Amanhã às 09:00',
		startAddress: 'Av. Paulista, 900 - São Paulo',
		receivedMinutes: 11,
	},
];

export const walkers: WalkerProfile[] = [
	{
		id: '1',
		name: 'Carlos Silva',
		rating: 4.9,
		reviews: 124,
		location: 'Zona Sul, Sao Paulo',
		serviceArea: 'Moema, Vila Mariana e Itaim Bibi',
		description:
			'Especialista em caes de grande porte e alta energia. Passeios com foco em seguranca e enriquecimento.',
		tags: ['Grande Porte', 'Energeticos', 'Adestrador'],
		verified: true,
		availability: [
			{ day: 'monday',    start: '07:00', end: '19:00' },
			{ day: 'tuesday',   start: '07:00', end: '19:00' },
			{ day: 'wednesday', start: '07:00', end: '19:00' },
			{ day: 'thursday',  start: '07:00', end: '19:00' },
			{ day: 'friday',    start: '07:00', end: '19:00' },
			{ day: 'saturday',  start: '08:00', end: '14:00' },
		],
		completedWalks: 812,
		joinedAt: '2023-02-01T00:00:00Z',
		trustChecks: {
			identityVerified: true,
			backgroundCheck: true,
		},
		certifications: [
			{ title: 'Adestramento Positivo', verified: true },
			{ title: 'Primeiros Socorros com Pets', verified: true },
			{ title: 'Manejo de Cão Reativo', verified: true },
			{ title: 'Experiência Comportamental', verified: true },
		],
		supportedSizes: ['medium', 'large', 'giant'],
		behaviorExpertise: ['agitado', 'reativo', 'multiplos-caes'],
	},
	{
		id: '2',
		name: 'Ana Lima',
		rating: 5.0,
		reviews: 89,
		location: 'Centro, Rio de Janeiro',
		serviceArea: 'Centro, Gloria e Catete',
		description:
			'Passeios tranquilos para caes idosos e com necessidades especiais. Comunicacao constante durante todo o percurso.',
		tags: ['Idosos', 'Medicacao', 'Pequeno Porte'],
		verified: true,
		availability: [
			{ day: 'monday',    start: '09:00', end: '16:00' },
			{ day: 'wednesday', start: '09:00', end: '16:00' },
			{ day: 'friday',    start: '09:00', end: '16:00' },
			{ day: 'saturday',  start: '08:00', end: '16:00' },
			{ day: 'sunday',    start: '09:00', end: '14:00' },
		],
		completedWalks: 467,
		joinedAt: '2023-06-15T00:00:00Z',
		trustChecks: {
			identityVerified: true,
			backgroundCheck: true,
		},
		certifications: [
			{ title: 'Cuidados com Cães Idosos', verified: true },
			{ title: 'Administração de Medicação', verified: true },
			{ title: 'Primeiros Socorros com Pets', verified: true },
			{ title: 'Socialização e Comportamento', verified: false },
		],
		supportedSizes: ['small', 'medium'],
		behaviorExpertise: ['idoso', 'filhote', 'medicacao'],
	},
	{
		id: '3',
		name: 'Pedro Santos',
		rating: 4.7,
		reviews: 56,
		location: 'Zona Norte, Sao Paulo',
		serviceArea: 'Santana, Tucuruvi e Casa Verde',
		description:
			'Trabalho com caes reativos usando manejo positivo. Rotas mais calmas e progressao gradual.',
		tags: ['Reativos', 'Ansiosos'],
		verified: false,
		availability: [
			{ day: 'monday',    start: '06:00', end: '09:00' },
			{ day: 'wednesday', start: '06:00', end: '09:00' },
			{ day: 'friday',    start: '06:00', end: '09:00' },
			{ day: 'saturday',  start: '07:00', end: '12:00' },
		],
		completedWalks: 231,
		joinedAt: '2024-01-10T00:00:00Z',
		trustChecks: {
			identityVerified: true,
			backgroundCheck: false,
		},
		certifications: [
			{ title: 'Manejo de Cão Reativo', verified: true },
			{ title: 'Passeio em Baixo Estímulo', verified: true },
			{ title: 'Primeiros Socorros com Pets', verified: false },
		],
		supportedSizes: ['small', 'medium', 'large'],
		behaviorExpertise: ['reativo', 'ansioso', 'agitado'],
	},
	{
		id: '4',
		name: 'Marcia Souza',
		rating: 4.8,
		reviews: 201,
		location: 'Vila Mariana, Sao Paulo',
		serviceArea: 'Vila Mariana, Aclimacao e Paraiso',
		description:
			'Mais de 5 anos de experiencia. Foco em previsibilidade, primeiros socorros e rotina estruturada para filhotes.',
		tags: ['Experiente', 'Primeiros Socorros'],
		verified: true,
		availability: [
			{ day: 'monday',    start: '06:30', end: '21:00' },
			{ day: 'tuesday',   start: '06:30', end: '21:00' },
			{ day: 'wednesday', start: '06:30', end: '21:00' },
			{ day: 'thursday',  start: '06:30', end: '21:00' },
			{ day: 'friday',    start: '06:30', end: '21:00' },
			{ day: 'saturday',  start: '06:30', end: '21:00' },
			{ day: 'sunday',    start: '09:00', end: '18:00' },
		],
		completedWalks: 1022,
		joinedAt: '2022-08-20T00:00:00Z',
		trustChecks: {
			identityVerified: true,
			backgroundCheck: true,
		},
		certifications: [
			{ title: 'Primeiros Socorros Veterinários', verified: true },
			{ title: 'Socialização de Filhotes', verified: true },
			{ title: 'Conduta Segura em Via Pública', verified: true },
			{ title: 'Experiência Comportamental Avançada', verified: true },
		],
		supportedSizes: ['small', 'medium', 'large', 'giant'],
		behaviorExpertise: ['filhote', 'agitado', 'multiplos-caes'],
	},
];

export const walks: WalkRecord[] = [
	{
		id: '1',
		walkerId: '1',
		clientName: 'Breno',
		petIds: ['1'],
		petNames: ['Rex'],
		status: 'accepted',
		dateLabel: 'Hoje · 14:30',
		scheduledAt: '2026-04-14T14:30:00-03:00',
		durationMinutes: 45,
		price: 44,
		distanceKm: 2.8,
		startAddress: 'Rua das Flores, 120 - Sao Paulo',
		endAddress: 'Parque Ibirapuera - Portao 3',
		notes: 'Evitar areas com muito barulho no inicio.',
		startCode: '1234',
		paymentMethodId: 'pm_1',
		participants: [
			{ id: 'client_1', name: 'Breno', role: 'client' },
			{ id: '1', name: 'Carlos Silva', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido confirmado', at: '14:02', state: 'done' },
			{ id: 't2', label: 'Aguardando passeio', at: 'Hoje · 14:30', state: 'current' },
			{ id: 't3', label: 'Passeio em andamento', at: '--', state: 'pending' },
			{ id: 't4', label: 'Passeio concluido', at: '--', state: 'pending' },
		],
	},
	{
		id: '2',
		walkerId: '2',
		clientName: 'Breno',
		petIds: ['1', '2'],
		petNames: ['Rex', 'Mel'],
		status: 'completed',
		hasReview: true,
		dateLabel: '18 Mar · 09:00',
		scheduledAt: '2026-03-18T09:00:00-03:00',
		durationMinutes: 60,
		price: 53,
		distanceKm: 3.2,
		startAddress: 'Av. Paulista, 900 - Sao Paulo',
		endAddress: 'Parque Trianon',
		notes: 'Levar agua para os dois caes.',
		paymentMethodId: 'pm_2',
		participants: [
			{ id: 'client_1', name: 'Breno', role: 'client' },
			{ id: '2', name: 'Ana Lima', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido confirmado', at: '08:20', state: 'done' },
			{ id: 't2', label: 'Passeador chegou ao local', at: '08:55', state: 'done' },
			{ id: 't3', label: 'Passeio em andamento', at: '09:03', state: 'done' },
			{ id: 't4', label: 'Passeio concluido', at: '10:02', state: 'done' },
		],
	},
	{
		id: '3',
		walkerId: '3',
		clientName: 'Breno',
		petIds: ['2'],
		petNames: ['Mel'],
		status: 'cancelled',
		dateLabel: '10 Mar · 16:00',
		scheduledAt: '2026-03-10T16:00:00-03:00',
		durationMinutes: 45,
		price: 44,
		distanceKm: 0,
		startAddress: 'Rua Vergueiro, 550 - Sao Paulo',
		notes: 'Cancelado por chuva forte.',
		paymentMethodId: 'pm_1',
		participants: [
			{ id: 'client_1', name: 'Breno', role: 'client' },
			{ id: '3', name: 'Pedro Santos', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido confirmado', at: '15:20', state: 'done' },
			{
				id: 't2',
				label: 'Passeio cancelado',
				at: '15:45',
				state: 'done',
				note: 'Condições climaticas severas.',
			},
		],
	},
	{
		id: '4',
		walkerId: '4',
		clientName: 'Breno',
		petIds: ['1'],
		petNames: ['Rex'],
		status: 'accepted',
		dateLabel: '25 Mar · 17:00',
		scheduledAt: '2026-03-25T17:00:00-03:00',
		durationMinutes: 45,
		price: 44,
		distanceKm: 0,
		startAddress: 'Rua Joaquim Tavora, 210 - Sao Paulo',
		notes: 'Primeiro passeio com esta passeadora.',
		paymentMethodId: 'pm_1',
		startCode: '1234',
		startLat: -23.5869,
		startLng: -46.6353,
		participants: [
			{ id: 'client_1', name: 'Breno', role: 'client' },
			{ id: '4', name: 'Marcia Souza', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido confirmado', at: '09:12', state: 'done' },
			{ id: 't2', label: 'Passeio agendado', at: '10:00', state: 'current' },
			{ id: 't3', label: 'Passeio em andamento', at: '10:05', state: 'pending' },
			{ id: 't4', label: 'Passeio concluido', at: '10:50', state: 'pending' },
		],
	},
	// Passeios do passeador Carlos Silva (walkerId '1') — perspectiva do passeador
	{
		id: '5',
		walkerId: '1',
		clientName: 'Fernanda Costa',
		petNames: ['Thor'],
		status: 'accepted',
		dateLabel: 'Amanhã · 10:00',
		scheduledAt: '2026-05-22T10:00:00-03:00',
		durationMinutes: 60,
		price: 64,
		distanceKm: 0,
		startAddress: 'Rua Haddock Lobo, 595 - Sao Paulo',
		paymentMethodId: 'pm_1',
		startCode: '5678',
		startLat: -23.5598,
		startLng: -46.6580,
		participants: [
			{ id: 'client_4', name: 'Fernanda Costa', role: 'client' },
			{ id: '1', name: 'Carlos Silva', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido aceito', at: '09:20', state: 'done' },
			{ id: 't2', label: 'Aguardando passeio', at: '10:00', state: 'current' },
			{ id: 't3', label: 'Passeio em andamento', at: '10:05', state: 'pending' },
			{ id: 't4', label: 'Passeio concluido', at: '11:05', state: 'pending' },
		],
	},
	{
		id: '6',
		walkerId: '1',
		clientName: 'Roberto Lima',
		petNames: ['Bolt', 'Nina'],
		status: 'completed',
		dateLabel: '19 Mai · 07:30',
		scheduledAt: '2026-05-19T07:30:00-03:00',
		durationMinutes: 45,
		price: 52,
		distanceKm: 2.2,
		startAddress: 'Al. Santos, 800 - Sao Paulo',
		endAddress: 'Parque Trianon',
		paymentMethodId: 'pm_1',
		participants: [
			{ id: 'client_5', name: 'Roberto Lima', role: 'client' },
			{ id: '1', name: 'Carlos Silva', role: 'walker' },
		],
		timeline: [
			{ id: 't1', label: 'Pedido aceito', at: '07:10', state: 'done' },
			{ id: 't2', label: 'Passeador chegou ao local', at: '07:28', state: 'done' },
			{ id: 't3', label: 'Passeio em andamento', at: '07:35', state: 'done' },
			{ id: 't4', label: 'Passeio concluido', at: '08:20', state: 'done' },
		],
	},
];

export const managedPaymentMethods: ManagedPaymentMethod[] = [
	{
		id: 'pm_1',
		type: 'credit_card',
		brand: 'Visa',
		label: '•••• 4242',
		holderName: 'Breno C',
		expiresAt: '12/29',
		isDefault: true,
		status: 'active',
	},
	{
		id: 'pm_2',
		type: 'credit_card',
		brand: 'Mastercard',
		label: '•••• 8888',
		holderName: 'Breno C',
		expiresAt: '03/28',
		isDefault: false,
		status: 'active',
	},
	{
		id: 'pm_3',
		type: 'pix',
		brand: 'PIX',
		label: 'CPF final 1234',
		holderName: 'Breno C',
		expiresAt: '--',
		isDefault: false,
		status: 'active',
	},
];

export const paymentHistory: PaymentHistoryItem[] = [
	{
		id: 'pay_1',
		walkId: '2',
		date: '2026-03-18',
		amount: 53,
		status: 'paid',
		methodId: 'pm_2',
		description: 'Passeio concluido com Ana Lima',
	},
	{
		id: 'pay_2',
		walkId: '3',
		date: '2026-03-10',
		amount: 44,
		status: 'failed',
		methodId: 'pm_1',
		description: 'Passeio cancelado (sem cobranca)',
	},
	{
		id: 'pay_3',
		walkId: '4',
		date: '2026-03-25',
		amount: 44,
		status: 'pending',
		methodId: 'pm_1',
		description: 'Passeio agendado',
	},
];

export const walkReviews: WalkReview[] = [
	{
		walkId: '2',
		walkerId: '2',
		rating: 5,
		comment: 'Passeio excelente, com atualizacoes no chat e muito cuidado com os dois caes.',
		createdAt: '2026-03-18T11:20:00-03:00',
	},
];

// ─── Walk GPS Routes ──────────────────────────────────────────────────────────
// Coordinates per walk ID — will come from the GPS trail stored per walk in the API.
export const walkRoutes: Record<string, [number, number][]> = {
	'1': [
		[-46.6333, -23.5505],
		[-46.6340, -23.5512],
		[-46.6348, -23.5518],
		[-46.6356, -23.5526],
		[-46.6365, -23.5535],
		[-46.6374, -23.5545],
		[-46.6383, -23.5556],
	],
	'2': [
		[-46.6536, -23.5651],
		[-46.6543, -23.5663],
		[-46.6550, -23.5676],
		[-46.6557, -23.5691],
		[-46.6563, -23.5706],
		[-46.6569, -23.5720],
		[-46.6574, -23.5745],
	],
};

// ─── Live Tracking Route ──────────────────────────────────────────────────────
// Simulated walker GPS coordinates — will come from real-time GPS stream in the API.
export const liveTrackingRoute: [number, number][] = [
	[-46.633308, -23.55052],
	[-46.634,    -23.551],
	[-46.6345,   -23.5515],
	[-46.635,    -23.552],
];

// ─── Chat Messages ────────────────────────────────────────────────────────────
// Initial messages for walk "1" — will come from the messaging API.
export const initialChatMessages: Array<{ id: string; senderId: string; text: string; timestamp: string }> = [
	{ id: '1', senderId: '2', text: 'Olá! Cheguei no local.', timestamp: '14:30' },
	{ id: '2', senderId: '1', text: 'Que ótimo! O Rex já está na porta.', timestamp: '14:31' },
	{ id: '3', senderId: '2', text: 'Já estou com ele. Vamos passear!', timestamp: '14:35' },
];

// ─── Walker Certificate Documents ────────────────────────────────────────────
// Uploaded certifications for the authenticated walker — will come from the documents API.
export const walkerCertificates: WalkerCertDocument[] = [
	{ id: 'c1', title: 'Adestramento Positivo',      fileName: 'cert_adestramento.pdf',        status: 'verified' },
	{ id: 'c2', title: 'Primeiros Socorros com Pets', fileName: 'primeiros_socorros_2024.jpg', status: 'pending'  },
];

// ─── Walker Public Reviews ────────────────────────────────────────────────────
// Reviews displayed on each walker's public profile page — will come from GET /walkers/{id}/reviews.
export const walkerPublicReviews: Record<string, WalkerPublicReview[]> = {
	'1': [
		{ id: 'pr1', walkId: '2', rating: 5, comment: 'Carlos é incrível! Rex adorou o passeio e ele enviou fotos a cada 10 minutos.', clientName: 'Ana S.',    createdAt: '2026-03-18T11:20:00Z' },
		{ id: 'pr2', walkId: '3', rating: 5, comment: 'Muito pontual e cuidadoso. Recomendo muito!',                                                            clientName: 'Julia M.', createdAt: '2026-03-10T15:00:00Z' },
		{ id: 'pr3', walkId: '5', rating: 4, comment: 'Ótimo passeador, Thor chegou cansado e feliz. Só achei o preço um pouco alto.',                          clientName: 'Roberto K.', createdAt: '2026-02-28T09:30:00Z' },
	],
	'2': [
		{ id: 'pr4', walkId: '1', rating: 5, comment: 'Ana é fantástica com os cães! Mel ficou super tranquila com ela.',                                      clientName: 'Clara T.',  createdAt: '2026-03-22T14:30:00Z' },
		{ id: 'pr5', walkId: '4', rating: 5, comment: 'Profissional e carinhosa. Segunda vez que contrato e vai ter terceira!',                                 clientName: 'Marcos L.', createdAt: '2026-03-15T10:00:00Z' },
	],
	'3': [
		{ id: 'pr6', walkId: '6', rating: 4, comment: 'Pedro foi muito atencioso com o Bob. Só demorou um pouco para chegar.',                                 clientName: 'Sofia R.',  createdAt: '2026-03-20T16:45:00Z' },
	],
	'4': [],
};

// ─── Walker Earnings View ─────────────────────────────────────────────────────
// Earnings history shown on the walker payments page — will come from GET /walkers/me/earnings.
export const walkerEarningsHistory: PaymentHistoryItem[] = [
	{ id: 'earn_1', walkId: '1', date: '2026-03-22', amount: 37, status: 'paid',    methodId: '', description: 'Passeio com Rex · Ana Silva'     },
	{ id: 'earn_2', walkId: '2', date: '2026-03-21', amount: 44, status: 'paid',    methodId: '', description: 'Passeio com Mel · Julia M.'       },
	{ id: 'earn_3', walkId: '3', date: '2026-03-15', amount: 52, status: 'paid',    methodId: '', description: 'Passeio com Thor · Roberto K.'    },
	{ id: 'earn_4', walkId: '4', date: '2026-03-25', amount: 44, status: 'pending', methodId: '', description: 'Passeio com Max · Carlos Lima'    },
];

// ─── Walker Bank Account ──────────────────────────────────────────────────────
// Bank account used for walker payouts — will come from GET /walkers/me/bank-account.
export const walkerBankAccountDefault: WalkerBankAccount = {
	bankName: '',
	accountType: 'checking',
	branch: '',
	accountNumber: '',
	holderName: '',
	holderDocument: '',
	pixKey: '',
};

// ─── Client Payment View ──────────────────────────────────────────────────────
// Payment transaction history shown on the client payments page — will come from the payments API.
export const clientPaymentHistory: Array<{
	id: number; walkId: string; date: string; walker: string; pets: string; duration: string; amount: string; status: string;
}> = [
	{ id: 1, walkId: '1', date: '22/03/2026', walker: 'João Silva', pets: 'Rex',       duration: '30 min', amount: 'R$ 44,00', status: 'Pago' },
	{ id: 2, walkId: '2', date: '18/03/2026', walker: 'João Silva', pets: 'Rex',       duration: '30 min', amount: 'R$ 44,00', status: 'Pago' },
	{ id: 3, walkId: '3', date: '10/03/2026', walker: 'João Silva', pets: 'Rex + Mel', duration: '45 min', amount: 'R$ 53,00', status: 'Pago' },
];

// ─── Client Dashboard — Recent Walks ─────────────────────────────────────────
// Simplified walk view for the client dashboard — will be derived from the walks API.
export const clientDashboardWalks: Array<{
	id: string; walkerName: string; petNames: string[]; status: WalkStatus; date: string; price: string;
}> = [
	{ id: '1', walkerName: 'Carlos Silva',  petNames: ['Rex'],        status: 'completed', date: '22 Mar · 14:30', price: 'R$ 44,00' },
	{ id: '2', walkerName: 'Ana Lima',      petNames: ['Rex', 'Mel'], status: 'completed', date: '18 Mar · 09:00', price: 'R$ 53,00' },
	{ id: '3', walkerName: 'Pedro Santos',  petNames: ['Mel'],        status: 'cancelled', date: '10 Mar · 16:00', price: 'R$ 44,00' },
];

// ─── Walker Dashboard — Completed Walks ──────────────────────────────────────
// Simplified completed-walk summary for the walker dashboard — will be derived from the walks API.
export const walkerDashboardWalks: Array<{
	id: string; clientName: string; petNames: string[]; date: string; earnings: number;
}> = [
	{ id: 'w1', clientName: 'Ana Silva',    petNames: ['Rex'],        date: '22 Mar', earnings: 37 },
	{ id: 'w2', clientName: 'Julia Mendes', petNames: ['Mel'],        date: '21 Mar', earnings: 37 },
	{ id: 'w3', clientName: 'Carla Pinto',  petNames: ['Rex', 'Bob'], date: '19 Mar', earnings: 48 },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const clientStats: ClientStats = {
	totalWalks: 23,
	rating: 4.9,
	totalReviews: 18,
};

export const walkerStats: WalkerStats = {
	totalWalks: 47,
	walksThisMonth: 12,
	rating: 4.8,
	totalReviews: 124,
	earningsToday: 74,
	earningsMonth: 840,
};

// ─── Document Status (per authenticated walker) ───────────────────────────────
export const documentStatus: DocumentsStatus = {
	identity: 'idle',
	background: 'idle',
	certificates: walkerCertificates,
};

// ─── Walker Availability ──────────────────────────────────────────────────────
export const walkerAvailability: Record<string, boolean> = { '1': false };

// ─── Walk Locations (GPS, per walk ID) ───────────────────────────────────────
export const walkLocations: Record<string, WalkLocation> = {
	'1': { walkId: '1', lat: -23.55052, lng: -46.633308, updatedAt: new Date().toISOString() },
	'5': { walkId: '5', lat: -23.5598,  lng: -46.6580,  updatedAt: new Date().toISOString() },
};

// ─── Chat Messages (per walk ID) ─────────────────────────────────────────────
export const chatMessagesByWalk: Record<string, Array<{ id: string; senderId: string; text: string; sentAt: string; read: boolean }>> = {
	'1': [
		{ id: '1', senderId: '2', text: 'Olá! Cheguei no local.',          sentAt: '2026-05-21T14:30:00-03:00', read: true  },
		{ id: '2', senderId: '1', text: 'Que ótimo! O Rex já está na porta.', sentAt: '2026-05-21T14:31:00-03:00', read: true  },
		{ id: '3', senderId: '2', text: 'Já estou com ele. Vamos passear!', sentAt: '2026-05-21T14:35:00-03:00', read: false },
	],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getWalkerById(walkerId: string) {
	return walkers.find((walker) => walker.id === walkerId);
}

export function getWalkById(walkId: string) {
	return walks.find((walk) => walk.id === walkId);
}

export function getReviewByWalkId(walkId: string) {
	return walkReviews.find((review) => review.walkId === walkId);
}

export function getWalksByWalkerId(walkerId: string) {
	return walks.filter((walk) => walk.walkerId === walkerId);
}
