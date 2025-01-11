// Linear Search
function linearSearch(arr: string[], target: string): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}

// Binary Search
function binarySearch(arr: string[], target: string): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

// Test setup
function testPerformance() {
  // Farklı boyutlarda testler yapalım
  const sizes = [100, 1000, 10000, 100000, 1000000];

  sizes.forEach((size) => {
    const arr = Array.from({ length: size }, (_, i) => `item${i}`);
    const target = `item${size - 1}`; // En son elemanı arayalım

    console.log(`\nDizi boyutu: ${size}`);

    console.time("Linear Search");
    linearSearch(arr, target);
    console.timeEnd("Linear Search");

    console.time("Binary Search");
    binarySearch(arr, target);
    console.timeEnd("Binary Search");
  });
}

testPerformance();
