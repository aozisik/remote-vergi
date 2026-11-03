// Plain-language glossary. Each `short` is one sentence that fits in an inline
// tooltip (<Terim id="dab">DAB</Terim>); `long` is the /sozluk/ entry.

export interface Term {
  id: string;
  term: string;
  short: string;
  long?: string;
  guide?: string;
}

export const glossary: Term[] = [
  {
    id: 'hizmet-ihracati',
    term: 'Hizmet ihracatı',
    short:
      'Türkiye\'den yurt dışındaki bir müşteriye verdiğin ve müşterinin yurt dışında faydalandığı hizmet.',
    long: 'Yazılım geliştirme, tasarım, mühendislik gibi işleri yurt dışındaki bir şirkete veya kişiye yapıp döviz karşılığı fatura kestiğinde hizmet ihraç etmiş olursun. Şartları sağlarsan kazancının tamamını vergi matrahından düşebilirsin.',
    guide: '/hizmet-ihracati/',
  },
  {
    id: 'kazanc-indirimi',
    term: 'Kazanç indirimi',
    short:
      'Hizmet ihracatı kazancının 2026\'da %100\'ünü vergi matrahından düşebilmen; şartlar sağlanırsa bu kazanca gelir vergisi çıkmaz.',
    long: 'Halk arasında "%100 istisna" denir. 2025\'te oran %80\'di, 11257 sayılı Cumhurbaşkanı Kararı ile 2026\'dan itibaren %100 oldu. Şartlar: müşteri yurt dışında, hizmetten yurt dışında faydalanılıyor ve kazancın tamamı beyanname tarihine kadar Türkiye\'ye getirilmiş.',
    guide: '/hizmet-ihracati-istisnasi/',
  },
  {
    id: 'matrah',
    term: 'Matrah',
    short:
      'Verginin üzerinden hesaplandığı tutar: gelirden giderler ve indirimler düşüldükten sonra kalan.',
  },
  {
    id: 'beyanname',
    term: 'Beyanname',
    short:
      'Vergi dairesine kazancını veya işlemlerini bildirdiğin form. Yıllık gelir vergisi beyannamesi her yıl mart ayında verilir.',
  },
  {
    id: 'gecici-vergi',
    term: 'Geçici vergi',
    short:
      'Yıl içinde üçer aylık dönemlerin kazancı üzerinden peşin ödenen vergi; yıl sonunda yıllık vergiden düşülür.',
    long: '7566 sayılı Kanun ile 4. dönem geri geldi; artık yılda dört kez verilir: 17 Mayıs, 17 Ağustos, 17 Kasım ve 17 Şubat. Kazancı ilgili tarihe kadar Türkiye\'ye getirdiysen hizmet ihracatı indirimi geçici vergide de uygulanabilir.',
    guide: '/vergi-takvimi/',
  },
  {
    id: 'smmm',
    term: 'SMMM (mali müşavir)',
    short:
      'Serbest Muhasebeci Mali Müşavir: defterini tutan, beyannamelerini senin adına veren meslek mensubu.',
    guide: '/sahis-sirketi-maliyet/',
  },
  {
    id: 'ymm',
    term: 'YMM tasdik raporu',
    short:
      'Yeminli Mali Müşavirin kazanç indirimini doğru uyguladığını onayladığı rapor; indirim tutarı eşiği aşarsa zorunlu.',
    long: '2026\'da yıllık hizmet ihracatı indirim tutarı 500.000 ₺\'yi veya toplam istisna ve indirimler 1.000.000 ₺\'yi aşarsa gerekir. Beyanname süresinden itibaren 2 ay içinde verilmezse indirim kaybedilir ve ceza kesilir.',
    guide: '/ymm-tasdik-ucreti/',
  },
  {
    id: 'bagkur',
    term: 'Bağ-Kur (4-B)',
    short:
      'Kendi işini yapanların, örneğin şahıs şirketi sahiplerinin, ödediği sosyal güvenlik primi.',
    long: 'Şahıs şirketi açtığın gün Bağ-Kur tescilin otomatik başlar ve aylık prim tahakkuk eder. Emeklilik ve sağlık güvencen buradan gelir.',
    guide: '/sahis-sirketi-maliyet/',
  },
  {
    id: 'sahis-sirketi',
    term: 'Şahıs şirketi',
    short:
      'Tek kişilik ticari işletme. Ayrı bir tüzel kişiliği yoktur; kazanç doğrudan senin gelirin sayılır.',
    guide: '/sahis-sirketi/',
  },
  {
    id: 'serbest-meslek',
    term: 'Serbest meslek',
    short:
      'Kişisel uzmanlığa dayanan işlerin bağımsız yapılması; fatura yerine serbest meslek makbuzu düzenlenir.',
    long: 'Hangi yapının (serbest meslek mi, şahıs şirketi mi) uygun olduğu yaptığın işe göre değişir. Hizmet ihracatı kazanç indirimi iki yapıda da uygulanabilir. Kararı mali müşavirinle ver.',
  },
  {
    id: 'mukim',
    term: 'Mukim (tam mükellef)',
    short:
      'İkametgâhı Türkiye\'de olan veya bir takvim yılında 6 aydan fazla Türkiye\'de kalan kişi; dünya çapındaki geliri Türkiye\'de vergilenir.',
  },
  {
    id: 'e-arsiv',
    term: 'e-Arşiv fatura',
    short:
      'Elektronik fatura türü. e-Fatura sistemine kayıtlı olmayan alıcılara, yurt dışı müşteriler dahil, bu şekilde fatura kesilir.',
    guide: '/302-11-1-a-fatura-ornegi/',
  },
  {
    id: '302',
    term: '302 istisna kodu',
    short:
      'KDV Kanunu 11/1-a hizmet ihracatı istisnasının faturadaki kodu. Seçildiğinde KDV %0 uygulanır.',
    guide: '/302-11-1-a-fatura-ornegi/',
  },
  {
    id: 'kdv',
    term: 'KDV',
    short:
      'Katma değer vergisi. Hizmet ihracatında istisnadır; faturaya KDV eklenmez.',
  },
  {
    id: 'dab',
    term: 'DAB (Döviz Alım Belgesi)',
    short:
      'Bankanın, yurt dışından gelen dövizi aldığını gösteren belge; hizmet bedelinin Türkiye\'ye geldiğini kanıtlar.',
    guide: '/yurtdisindan-odeme-alma/',
  },
  {
    id: 'stopaj',
    term: 'Stopaj',
    short:
      'Ödemeyi yapan tarafın vergiyi kesip senin adına devlete ödemesi. Tevkifat da denir.',
  },
  {
    id: 'damga-vergisi',
    term: 'Damga vergisi',
    short:
      'Verdiğin her beyanname için ödenen sabit tutarlı vergi; şahıs şirketinin sabit giderlerinden biri.',
  },
  {
    id: 'munhasiran',
    term: 'Münhasıran yurt dışı',
    short:
      'Hizmetten "yalnızca yurt dışında faydalanılması" şartı. Uygulama mağazası gelirlerinde tartışmalı noktadır.',
    guide: '/app-store-play-store-vergi/',
  },
  {
    id: 'contractor',
    term: 'Contractor (sözleşmeli)',
    short:
      'Yabancı şirkete çalışan olarak değil, hizmet sağlayıcı olarak bağlanman. Maaş bordron olmaz; her ay fatura kesersin.',
    guide: '/yurtdisina-remote-calismak/',
  },
  {
    id: 'eor',
    term: 'EOR (Employer of Record)',
    short:
      'Seni kendi yerel şirketinden bordrolu çalışan olarak işe alan aracı. Türkiye\'de bordrolu olursan gelirin ücret sayılır, hizmet ihracatı indirimi uygulanmaz.',
    guide: '/yurtdisina-remote-calismak/',
  },
  {
    id: 'mor',
    term: 'Merchant of Record',
    short:
      'Satışı kendi adına yapıp son müşteriye faturayı kesen ve satış vergilerini üstlenen aracı (Paddle, Polar gibi).',
    guide: '/merchant-of-record-vergi/',
  },
];

export const termById = (id: string): Term | undefined =>
  glossary.find((t) => t.id === id);
