// Site structure that is not a guide: topics, tools and the reader personas.
// Guides themselves come from the `rehberler` content collection (see
// src/data/guides.ts); their frontmatter names the topic and personas they
// belong to, so a new guide shows up in nav, hubs and related lists on its own.

export type TopicId = 'baslangic' | 'sirket' | 'fatura' | 'platform' | 'kariyer';

export interface Topic {
  id: TopicId;
  title: string;
  blurb: string;
}

export interface Tool {
  href: string;
  title: string;
  blurb: string;
}

export type IllustrationName =
  | 'company'
  | 'invoice'
  | 'transfer'
  | 'calculator'
  | 'laptop'
  | 'phone'
  | 'calendar'
  | 'search'
  | 'controller'
  | 'pen';

export type IllustrationTone = 'rose' | 'mint' | 'amber' | 'sky' | 'lilac';

export type PersonaId = 'yazilimci' | 'mobil' | 'oyun' | 'hizmet';

export interface Persona {
  id: PersonaId;
  href: string;
  name: string;
  short: string;
  example: string;
  icon: IllustrationName;
  tone: IllustrationTone;
}

export const topics: Topic[] = [
  {
    id: 'baslangic',
    title: 'Hizmet ihracatı ve vergi',
    blurb: '%100 kazanç indirimi, şartları ve YMM tasdiki',
  },
  {
    id: 'sirket',
    title: 'Şahıs şirketi',
    blurb: 'Kuruluş, aylık giderler ve net kazanç',
  },
  {
    id: 'fatura',
    title: 'Fatura ve ödeme alma',
    blurb: 'e-Arşiv faturası, döviz ve banka süreci',
  },
  {
    id: 'platform',
    title: 'Platformlar',
    blurb: 'Upwork, App Store, Google Play, Paddle',
  },
  {
    id: 'kariyer',
    title: 'Remote çalışma',
    blurb: 'İş bulma, sözleşme ve ilk adımlar',
  },
];

export const tools: Tool[] = [
  {
    href: '/vergi-takvimi/',
    title: 'Vergi takvimi',
    blurb: 'Sadece senin son tarihlerin, takvimine abone ol',
  },
  {
    href: '/#hesapla',
    title: 'Net kazanç hesaplayıcı',
    blurb: 'Döviz gelirin, %100 istisna sonrası elinde ne kalır',
  },
  {
    href: '/sahis-sirketi-vergi-hesaplama/',
    title: 'Gelir vergisi hesaplayıcı',
    blurb: 'Yurt içi ve yurt dışı gelir birlikte',
  },
  {
    href: '/app-store-play-store-vergi/#hesaplayici',
    title: 'Uygulama geliri karşılaştırma',
    blurb: '%15 stopaj ile şahıs şirketi yolu yan yana',
  },
  {
    href: '/ymm-tasdik-ucreti/',
    title: 'YMM tasdik ücretleri',
    blurb: 'Gerçek teklifler, anonim karşılaştırma',
  },
];

export const personas: Persona[] = [
  {
    id: 'yazilimci',
    href: '/yazilimci/',
    name: 'Yazılımcı',
    short: 'Yurt dışı şirketlere sözleşmeli çalışıyorum',
    example: 'Deel, Remote, doğrudan fatura',
    icon: 'laptop',
    tone: 'rose',
  },
  {
    id: 'mobil',
    href: '/mobil-uygulama-gelistirici/',
    name: 'Uygulama geliştirici',
    short: 'App Store ve Google Play\'den gelirim var',
    example: 'iOS, Android, AdMob',
    icon: 'phone',
    tone: 'sky',
  },
  {
    id: 'oyun',
    href: '/oyun-gelistirici/',
    name: 'Oyun geliştirici',
    short: 'Oyunumu Steam veya mağazalarda satıyorum',
    example: 'Steam, itch.io, yayıncı',
    icon: 'controller',
    tone: 'lilac',
  },
  {
    id: 'hizmet',
    href: '/hizmet-ihracatcisi/',
    name: 'Tasarımcı ve diğer meslekler',
    short: 'Yurt dışına başka bir hizmet veriyorum',
    example: 'Tasarım, mühendislik, eğitim',
    icon: 'pen',
    tone: 'amber',
  },
];

export const topicById = (id: TopicId): Topic =>
  topics.find((t) => t.id === id) as Topic;

export const personaById = (id: PersonaId): Persona =>
  personas.find((p) => p.id === id) as Persona;
