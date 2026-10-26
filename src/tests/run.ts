import { runAllGameTests } from './game.test';

// Mock localStorage for Node environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    length: store.size,
  };
}

console.log('--- EXECUTING SNAKE EVOLUTION GAME TESTS ---');
const report = runAllGameTests();
report.results.forEach((r, idx) => {
  const mark = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${idx + 1}] ${mark}: ${r.name}`);
  if (r.error) {
    console.error(`    Error: ${r.error}`);
  }
});

console.log(`\nSUMMARY: ${report.passed} Passed, ${report.failed} Failed out of ${report.results.length} total tests.`);
if (report.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
