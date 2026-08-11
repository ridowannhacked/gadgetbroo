import prisma from '../lib/prisma';

const bdLocations = {
  "Dhaka": [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail"
  ],
  "Chattogram": [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati"
  ],
  "Rajshahi": [
    "Bogura",
    "Chapainawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj"
  ],
  "Khulna": [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira"
  ],
  "Barishal": [
    "Barishal",
    "Barguna",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur"
  ],
  "Sylhet": [
    "Habiganj",
    "Moulvibazar",
    "Sunamganj",
    "Sylhet"
  ],
  "Rangpur": [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon"
  ],
  "Mymensingh": [
    "Jamalpur",
    "Mymensingh",
    "Netrokona",
    "Sherpur"
  ]
};

async function main() {
  console.log('Seeding Comprehensive Bangladesh Shipping Zones...');

  const zones = [];
  for (const [state, cities] of Object.entries(bdLocations)) {
    for (const city of cities) {
      // Inside Dhaka City is 60 BDT, everywhere else is 120 BDT
      const deliveryFee = (state === 'Khulna' && city === 'Khulna') ? 60.00 : 120.00;
      zones.push({ stateName: state, cityName: city, deliveryFee });
    }
  }

  for (const zone of zones) {
    await prisma.shippingZone.upsert({
      where: {
        stateName_cityName: {
          stateName: zone.stateName,
          cityName: zone.cityName,
        }
      },
      update: {
        deliveryFee: zone.deliveryFee,
      },
      create: {
        stateName: zone.stateName,
        cityName: zone.cityName,
        deliveryFee: zone.deliveryFee,
      }
    });
  }

  console.log(`Successfully seeded ${zones.length} Shipping Zones! ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
