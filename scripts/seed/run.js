import { seedMonastery } from './seeders/monastery.js';

const seeders = {
  monastery: seedMonastery,
};

const [, , target] = process.argv;

if (!target || !seeders[target]) {
  console.error('Usage: node scripts/seed/run.js <seeder>');
  console.error(`Available: ${Object.keys(seeders).join(', ')}`);
  process.exit(1);
}

console.log(`\nSeeding: ${target}...`);

seeders[target]()
  .then(() => {
    console.log(`\n✓ ${target} seeded successfully`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n✗ ${target} failed`);
    console.error(`  Error: ${err.message}`);
    if (err.response) {
      console.error(`  Status: ${err.response.status}`);
      console.error(`  Body:`, JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  });
