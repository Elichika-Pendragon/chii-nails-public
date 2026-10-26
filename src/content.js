// Portfolio fixture only. No production contacts, location or account configuration.
export const salon = { name: 'Chii Nails Demo', directions: 'https://studio.example/location', openingHours: [{days:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'17:00',lastBooking:'14:00'},{days:['Saturday','Sunday'],opens:'08:00',closes:'12:00',lastBooking:'10:00'}], address: 'Example studio, Palembang, Indonesia', maps: 'https://studio.example/location', whatsapp: 'https://studio.example/contact', instagram: 'https://studio.example/gallery', shopee: 'https://studio.example/shop', custom: 'https://studio.example/contact' };

// Illustrative menu snapshot used by the deterministic tests; not a current price offer.
export const priceGroups = [
  { id: 'nail-art', title: 'Nail art', note: 'Harga untuk 10 jari', items: [
    { name: 'Nail polos', price: 25000 },
    { name: 'Nail mood temperatur', price: 30000 },
    { name: 'French nails', price: 50000 },
    { name: 'Marble', price: 45000 },
    { name: 'Ombré nails', price: 50000, max: 55000 },
    { name: 'Request design', detail: 'Mengikuti tingkat kesulitan', price: 65000, max: 155000 },
  ] },
  { id: 'cat-eye', title: 'Cat eye', note: 'Harga untuk 10 jari', items: [
    { name: 'Cat eye / silky cat eye', price: 40000 },
    { name: 'Cat eye universal', price: 40000 },
    { name: 'Crystal cat eye', price: 40000 },
    { name: 'Cat eye rainbow / mix colors', price: 40000, max: 45000 },
    { name: 'Cat eye love / bunny', price: 40000 },
  ] },
  { id: 'extras', title: 'Extensions & extras', note: 'Tambahan untuk set pilihanmu', items: [
    { name: 'Extension', detail: '1 kuku', price: 4000 },
    { name: 'Extension', detail: '10 kuku', price: 30000 },
    { name: 'Glitter', detail: '10 jari', price: 5000 },
    { name: 'Stiker', price: 1000 },
    { name: 'Aksesori 3D', price: 1000, max: 8000 },
  ] },
  { id: 'removal', title: 'Nail removal', note: 'Pilih sesuai jenis dan jumlah kuku', items: [
    { name: 'Remove fake nails', detail: '1 kuku', price: 3500 },
    { name: 'Remove fake nails', detail: '10 kuku', price: 25000 },
    { name: 'Remove nail gel', detail: '1 kuku', price: 3000 },
    { name: 'Remove nail gel', detail: '10 kuku', price: 23000 },
    { name: 'Remove nail biasa', detail: '10 kuku', price: 6000 },
  ] },
];

// Press-on estimates: owner approved menu design fees + base kit (23 Oct 2026).
export const pressOnPricing = {
  base: 22000, glue: 13000,
  exampleDesign: 40000,
  kit: ['Fake nails 10 pcs', 'Kikir kuku 1 pcs', 'Lem stiker 3 pcs', 'Wipe kering pink', 'Alcohol wipe', 'Wooden cuticle pusher'],
};
