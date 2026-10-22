import type { Locale } from "./config";

const id = {
  title: "Kontak", description: "Hubungi tim kami melalui WhatsApp, email, atau telepon untuk membicarakan kebutuhan perjalanan Anda.",
  address: "Alamat kantor", addressNote: "Kota, provinsi, kode pos, dan titik lokasi belum dikonfirmasi. Peta belum tersedia.",
  email: "Email resmi", emailAction: "Kirim Email", primary: "WhatsApp utama", alternative: "WhatsApp alternatif", whatsappAction: "Hubungi WhatsApp", phoneAction: "Telepon",
  note: "Pesan dan panggilan dibuka melalui aplikasi pilihan Anda. Membuka WhatsApp belum mengirim pesan atau mengonfirmasi pemesanan. Detail layanan dan ketersediaan perlu dikonfirmasi oleh tim kami.",
  quoteMessage: "Saya ingin menanyakan pilihan tanggal, jumlah peserta yang diperlukan, dan penawaran aktual untuk konsep ini. Saya memahami bahwa harga belum final dan ketersediaan belum dikonfirmasi.",
  bookingAction: "Konsultasi via WhatsApp", bookingNote: "Diskusikan rencana perjalanan melalui WhatsApp. Website ini tidak memproses pemesanan otomatis atau pembayaran.",
  message: "Halo, saya ingin berkonsultasi mengenai perjalanan bersama", bookingMessage: "Halo, saya ingin menanyakan rencana perjalanan dan proses pemesanan bersama", packageMessage: "Halo, saya ingin menanyakan paket", subject: "Pertanyaan perjalanan", packageSubject: "Pertanyaan paket",
};
export type ContactDictionary = typeof id;
const en: ContactDictionary = {
  title: "Contact", description: "Contact our team through WhatsApp, email, or phone to discuss your travel needs.",
  address: "Office address", addressNote: "The city, province, postal code, and map location have not been confirmed. A map is not available yet.",
  email: "Official email", emailAction: "Email Us", primary: "Primary WhatsApp", alternative: "Alternative WhatsApp", whatsappAction: "Contact via WhatsApp", phoneAction: "Call",
  note: "Messages and calls open in your chosen app. Opening WhatsApp does not send a message or confirm a booking. Our team must confirm service details and availability.",
  quoteMessage: "I would like to ask about possible dates, the required participant numbers, and an actual quotation for this concept. I understand that pricing is not final and availability is not confirmed.",
  bookingAction: "Discuss via WhatsApp", bookingNote: "Discuss your travel plans through WhatsApp. This website does not process automatic bookings or payments.",
  message: "Hello, I would like to discuss travel plans with", bookingMessage: "Hello, I would like to ask about travel plans and the booking process with", packageMessage: "Hello, I would like to ask about the package", subject: "Travel inquiry", packageSubject: "Package inquiry",
};
export function getContactDictionary(locale: Locale): ContactDictionary { return locale === "id" ? id : en; }
