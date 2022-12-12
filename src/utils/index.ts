export const truncateAddress = (address: string) => {
  return address.slice(0, 4) + ".." + address.slice(-4);
};

export const BLOCK_OF_ATOMIC_NUMBERS = [
  [1, 2, 3, 4, 11, 12, 19, 20, 37, 38, 55, 56, 87, 88, 119],
  [
    5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 31, 32, 33, 34, 35, 36, 49, 50,
    51, 52, 53, 54, 81, 82, 83, 84, 85, 86, 113, 114, 115, 116, 117, 118,
  ],
  [
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 103, 104, 105, 106, 107, 108,
    109, 110, 111, 112,
  ],
  [
    57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 89, 90, 91, 92, 93,
    94, 95, 96, 97, 98, 99, 100, 101, 102,
  ],
];

export const getBlockAtomicNumbers = (n: number) => {
  if (BLOCK_OF_ATOMIC_NUMBERS[0].includes(n)) {
    return BLOCK_OF_ATOMIC_NUMBERS[0];
  } else if (BLOCK_OF_ATOMIC_NUMBERS[1].includes(n)) {
    return BLOCK_OF_ATOMIC_NUMBERS[1];
  } else if (BLOCK_OF_ATOMIC_NUMBERS[2].includes(n)) {
    return BLOCK_OF_ATOMIC_NUMBERS[2];
  } else if (BLOCK_OF_ATOMIC_NUMBERS[3].includes(n)) {
    return BLOCK_OF_ATOMIC_NUMBERS[3];
  } else {
    [];
  }
  return [];
};

export const getBlock = (n: number) => {
  // block number * 10
  if (BLOCK_OF_ATOMIC_NUMBERS[0].includes(n)) {
    return 10;
  } else if (BLOCK_OF_ATOMIC_NUMBERS[1].includes(n)) {
    return 20;
  } else if (BLOCK_OF_ATOMIC_NUMBERS[2].includes(n)) {
    return 30;
  } else {
    return 40;
  }
};
