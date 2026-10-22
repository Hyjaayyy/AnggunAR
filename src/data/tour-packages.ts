import type { PackageImage, TourPackage } from "@/types/tour-package";

function image(slug: string, name: string, slot: "cover" | "detail-01" | "detail-02"): PackageImage {
  return { src: `/images/packages/${slug}/${slot}.webp`, position: "50% 50%", alt: { id: `${name} - foto ${slot}`, en: `${name} - ${slot} photo` } };
}

// Editorial concepts only. No official itinerary, duration, price or facilities supplied.
const draftPackages: readonly TourPackage[] = [
  { slug: "batam-city-escape", name: "Batam City Escape", category: "city", id: "Kota & ikon", en: "City & landmarks" },
  { slug: "coastal-slow-days", name: "Coastal Slow Days", category: "coast", id: "Pantai & suasana", en: "Coast & atmosphere" },
  { slug: "island-perspectives", name: "Island Perspectives", category: "islands", id: "Pulau & bahari", en: "Islands & sea" },
].map((item): TourPackage => ({
  slug: item.slug, status: "draft", demo: true, price: null, durationDays: null, location: null,
  category: { id: item.category, label: { id: item.id, en: item.en } },
  images: [image(item.slug, item.name, "cover"), image(item.slug, item.name, "detail-01"), image(item.slug, item.name, "detail-02")],
  content: {
    id: { name: item.name, description: "Konsep editorial untuk pratinjau desain. Rincian perjalanan resmi belum dikonfirmasi. Contoh ini bukan penawaran dan belum dapat dipesan." },
    en: { name: item.name, description: "An editorial concept for design preview. Official travel details have not been confirmed. This example is not an offer and cannot be booked." },
  },
  itinerary: null, included: null, excluded: null, information: [],
}));

// Add confirmed package objects here. Keep editorial demo entries in draftPackages.
const marketSources = {
  listing: "https://www.pegijalan.com/paket-wisata/batam",
  threeDays: "https://www.pegijalan.com/paket-wisata/paket-wisata-batam-3-hari-2-malam",
  weekend: "https://www.batam-wisata.com/paket-tour-batam-2-hari-1-malam-253.asp",
  tour: "https://tourbatam.com/tour/",
  city: "https://batamcitytravel.com/destinasi-package/",
} as const;

// Owner-supplied planning targets, not approved offers or supplier quotations.
// No minimum group size is assumed; official price and inclusions remain null.
const marketConcepts = [
  {
    slug: "batam-city-highlights", name: "Batam City Highlights", days: 1, nights: 0, amount: 450000, location: "batam", category: "city",
    description: { id: "Konsep sehari untuk mengenal sisi perkotaan Batam, dari Welcome to Batam menuju kawasan Nagoya dan pilihan oleh-oleh. Urutan kunjungan masih perlu ditinjau sesuai titik awal dan waktu perjalanan.", en: "A one-day concept linking Welcome to Batam with city landmarks, Nagoya and souvenir browsing. The visit order still needs review against the starting point and travel time." },
    itinerary: [{ id: "Mengenal kota secara bertahap", en: "An introduction to the city", activities: { id: ["Usulkan awal kunjungan di Welcome to Batam dan pilih landmark kota bersama tim.", "Sediakan waktu menjelajahi Nagoya sebelum singgah di pusat oleh-oleh yang akan dikonfirmasi."], en: ["Propose a start at Welcome to Batam and select city landmarks with the team.", "Allow time to explore Nagoya before a souvenir stop to be confirmed."] } }],
    sources: [marketSources.city, marketSources.listing],
  },
  {
    slug: "barelang-culinary-experience", name: "Barelang & Culinary Experience", days: 1, nights: 0, amount: 725000, location: "batam", category: "culinary",
    description: { id: "Gagasan perjalanan sehari dengan Barelang sebagai fokus, jeda foto, dan kesempatan membahas pilihan kuliner lokal. Tempat makan, menu, biaya, dan jam kunjungan belum ditetapkan.", en: "A one-day idea centred on Barelang, photo breaks and a discussion of local dining options. Restaurants, menus, costs and visit times have not been agreed." },
    itinerary: [{ id: "Bentang Barelang dan ide kuliner", en: "Barelang views and dining ideas", activities: { id: ["Rencanakan kunjungan Jembatan Barelang dan titik foto sesuai kondisi serta izin akses.", "Bahas pilihan kuliner dan pusat oleh-oleh; konsumsi tidak dinyatakan termasuk."], en: ["Plan a Barelang Bridge visit and photo stops subject to conditions and access permissions.", "Discuss dining and souvenir options; meals are not stated as included."] } }],
    sources: [marketSources.listing, marketSources.city],
  },
  {
    slug: "batam-weekend-escape", name: "Batam Weekend Escape", days: 2, nights: 1, amount: 950000, location: "batam", category: "city",
    description: { id: "Rancangan akhir pekan untuk membagi eksplorasi kota, ide kuliner dan belanja dalam dua hari. Kebutuhan satu malam hotel akan dibicarakan terpisah; belum ada hotel atau fasilitas yang dijanjikan.", en: "A weekend outline spreading city exploration, dining ideas and shopping over two days. A one-night hotel requirement will be discussed separately; no hotel or facilities are promised." },
    itinerary: [
      { id: "Menentukan ritme akhir pekan", en: "Set the weekend pace", activities: { id: ["Susun pilihan city tour dan jeda kuliner sesuai waktu kedatangan.", "Bahas kebutuhan menginap satu malam, tanpa konfirmasi nama hotel atau biaya termasuk."], en: ["Arrange city tour ideas and dining breaks around the arrival time.", "Discuss one-night accommodation needs without confirming a hotel or included cost."] } },
      { id: "Belanja dan ruang bebas", en: "Shopping and unplanned time", activities: { id: ["Alokasikan waktu belanja atau oleh-oleh sebelum waktu bebas.", "Sesuaikan akhir perjalanan dengan rencana keberangkatan; transfer belum dikonfirmasi."], en: ["Allocate time for shopping or souvenirs followed by free time.", "Fit the final stops around departure plans; transfers are not confirmed."] } },
    ], sources: [marketSources.listing, marketSources.weekend, marketSources.city],
  },
  {
    slug: "batam-complete-discovery", name: "Batam Complete Discovery", days: 3, nights: 2, amount: 1500000, location: "batam", category: "city",
    description: { id: "Konsep tiga hari untuk memberi ruang terpisah bagi kawasan kota, Barelang, kuliner dan belanja. Dua malam adalah durasi perencanaan, bukan jaminan kamar atau layanan hotel.", en: "A three-day concept giving the city, Barelang, dining and shopping their own time. Two nights describe the planning duration, not a guarantee of rooms or hotel services." },
    itinerary: [
      { id: "Orientasi kota", en: "City orientation", activities: { id: ["Pilih landmark kota dan bahas preferensi kuliner dengan mempertimbangkan waktu kedatangan."], en: ["Select city landmarks and discuss dining preferences in light of arrival time."] } },
      { id: "Fokus kawasan Barelang", en: "Focus on Barelang", activities: { id: ["Usulkan waktu khusus untuk Barelang dan foto, dengan rute akhir bergantung kondisi perjalanan."], en: ["Propose dedicated time for Barelang and photography, with the final route dependent on travel conditions."] } },
      { id: "Belanja dan waktu bebas", en: "Shopping and free time", activities: { id: ["Bahas pilihan belanja, waktu bebas dan akhir perjalanan tanpa menjanjikan transfer atau tiket."], en: ["Discuss shopping, free time and departure arrangements without promising transfers or tickets."] } },
    ], sources: [marketSources.threeDays, marketSources.tour],
  },
  {
    slug: "bintan-island-escape", name: "Bintan Island Escape", days: 1, nights: 0, amount: 850000, location: "bintan", category: "islands",
    description: { id: "Ide sehari untuk memilih suasana pantai dan landmark Bintan sesuai minat peserta. Titik awal, akses penyeberangan, objek kunjungan dan tiket harus dikonfirmasi sebelum rencana dinyatakan layak.", en: "A one-day idea for choosing Bintan coastal settings and landmarks around participants' interests. The starting point, crossing access, stops and tickets must be confirmed before the plan is considered feasible." },
    itinerary: [{ id: "Pantai dan landmark pilihan", en: "Selected coast and landmarks", activities: { id: ["Tentukan titik awal di Bintan dan bahas opsi pantai serta landmark yang sesuai waktu tersedia.", "Tinjau kebutuhan penyeberangan bila berangkat dari luar Bintan; jadwal dan biayanya belum termasuk atau dijamin."], en: ["Agree a starting point in Bintan and discuss coastal and landmark options that fit the available time.", "Review crossing needs if starting outside Bintan; schedules and costs are not included or guaranteed."] } }],
    sources: [marketSources.city, marketSources.tour],
  },
  {
    slug: "batam-bintan-discovery", name: "Batam–Bintan Discovery", days: 3, nights: 2, amount: 2500000, location: "batam-bintan", category: "islands",
    description: { id: "Rangkaian ide tiga hari yang menghubungkan Batam dan Bintan dengan minat pantai serta budaya. Penyeberangan, waktu tempuh dan kebutuhan dua malam menginap masih memerlukan penawaran pemasok.", en: "A three-day set of ideas connecting Batam and Bintan with coastal and cultural interests. Crossings, journey times and two-night accommodation needs still require supplier quotations." },
    itinerary: [
      { id: "Mulai dari Batam", en: "Begin in Batam", activities: { id: ["Bahas pilihan pengenalan kota Batam dan susun kebutuhan lintas pulau untuk hari berikutnya."], en: ["Discuss a Batam city introduction and outline inter-island requirements for the following day."] } },
      { id: "Rencana lintas pulau", en: "Plan the island crossing", activities: { id: ["Tinjau penyeberangan ke Bintan dan pilihan pesisir; kapal, jadwal, tiket dan kondisi cuaca belum dikonfirmasi."], en: ["Review a crossing to Bintan and coastal options; vessel, timetable, tickets and weather conditions are not confirmed."] } },
      { id: "Budaya dan penutup perjalanan", en: "Culture and the final day", activities: { id: ["Pilih pengenalan budaya dan waktu bebas setelah titik akhir serta kebutuhan perjalanan pulang disepakati."], en: ["Choose a cultural introduction and free time after agreeing the end point and onward travel needs."] } },
    ], sources: [marketSources.tour, marketSources.city],
  },
];

const pendingPhoto = (): PackageImage => ({ src: null, position: "50% 50%", alt: { id: "", en: "" } });
const marketDraftPackages: readonly TourPackage[] = marketConcepts.map((concept): TourPackage => ({
  slug: concept.slug, status: "draft", demo: false, price: null,
  planning: { verification: "unverified", indicativePricePerPerson: concept.amount, participantBasis: null, durationNights: concept.nights, researchedOn: "2026-10-22", sourceUrls: concept.sources },
  durationDays: concept.days,
  location: { id: concept.location, label: { id: concept.location === "batam-bintan" ? "Batam & Bintan" : concept.location === "bintan" ? "Bintan" : "Batam", en: concept.location === "batam-bintan" ? "Batam & Bintan" : concept.location === "bintan" ? "Bintan" : "Batam" } },
  category: { id: concept.category, label: { id: concept.category === "culinary" ? "Kuliner & ikon" : concept.category === "islands" ? "Pulau & bahari" : "Kota & ikon", en: concept.category === "culinary" ? "Dining & landmarks" : concept.category === "islands" ? "Islands & sea" : "City & landmarks" } },
  images: [pendingPhoto(), pendingPhoto(), pendingPhoto()],
  content: { id: { name: concept.name, description: concept.description.id }, en: { name: concept.name, description: concept.description.en } },
  itinerary: concept.itinerary.map((day, index) => ({ day: index + 1, title: { id: day.id, en: day.en }, activities: day.activities })),
  included: null, excluded: null, information: [],
}));

export const tourPackages: readonly TourPackage[] = [...draftPackages, ...marketDraftPackages];
