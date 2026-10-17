import { DotData, PlayerId, TetrahedronValidation } from '../types/game';

export const MIN_DOT_DISTANCE = 4.0;
export const MIN_TETRAHEDRON_VOLUME = 15.0;
export const TOTAL_DOT_COUNT = 120;
export const CLOUD_RADIUS = 18.0;

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// Distance between two 3D points
export function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Vector cross product: a x b
export function crossProduct(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

// Vector dot product: a . b
export function dotProduct(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Vector subtract: a - b
export function subVectors(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/**
 * Computes the signed volume of a tetrahedron with vertices A, B, C, D.
 * Formula: ((A - D) . ((B - D) x (C - D))) / 6
 */
export function calculateTetrahedronVolume(
  a: Vector3D,
  b: Vector3D,
  c: Vector3D,
  d: Vector3D
): number {
  const ad = subVectors(a, d);
  const bd = subVectors(b, d);
  const cd = subVectors(c, d);
  const cross = crossProduct(bd, cd);
  const det = dotProduct(ad, cross);
  return Math.abs(det) / 6.0;
}

/**
 * Determinant of 3x3 matrix constructed from three vectors
 */
function det3x3(v1: Vector3D, v2: Vector3D, v3: Vector3D): number {
  return (
    v1.x * (v2.y * v3.z - v2.z * v3.y) -
    v1.y * (v2.x * v3.z - v2.z * v3.x) +
    v1.z * (v2.x * v3.y - v2.y * v3.x)
  );
}

/**
 * Strict Point-in-Tetrahedron test using the 4-face plane method / signed determinants.
 * Checks if point P lies strictly within the open interior of tetrahedron ABCD.
 */
export function isPointInsideTetrahedron(
  p: Vector3D,
  a: Vector3D,
  b: Vector3D,
  c: Vector3D,
  d: Vector3D
): boolean {
  // Volume reference orientation
  const v0 = det3x3(subVectors(b, a), subVectors(c, a), subVectors(d, a));
  if (Math.abs(v0) < 1e-7) return false; // Degenerate tetrahedron

  // Check orientation of P relative to each of the 4 faces
  const v1 = det3x3(subVectors(b, p), subVectors(c, p), subVectors(d, p));
  const v2 = det3x3(subVectors(c, p), subVectors(a, p), subVectors(d, p));
  const v3 = det3x3(subVectors(a, p), subVectors(b, p), subVectors(d, p));
  const v4 = det3x3(subVectors(b, p), subVectors(a, p), subVectors(c, p));

  // For strict interior containment, all 4 sub-volumes must have the SAME strict sign as v0
  const sign = Math.sign(v0);
  const eps = 1e-4; // Strict interior boundary margin

  return (
    v1 * sign > eps &&
    v2 * sign > eps &&
    v3 * sign > eps &&
    v4 * sign > eps
  );
}

/**
 * Validates 4 selected dots against the game rules:
 * 1. Count must be 4
 * 2. Pairwise distance between all selected dots must be >= MIN_DOT_DISTANCE (~4.0 units)
 * 3. Tetrahedron volume must be >= MIN_TETRAHEDRON_VOLUME (~15.0 cubic units)
 * 4. Finds all dots captured inside (neutral + opponent owned, excluding owner's own dots)
 */
export function validateTetrahedron(
  selectedDots: DotData[],
  allDots: DotData[],
  currentPlayer: PlayerId
): TetrahedronValidation {
  if (selectedDots.length !== 4) {
    return {
      isValid: false,
      volume: 0,
      minDistance: 0,
      reason: `Select exactly 4 dots (${selectedDots.length}/4 selected)`,
      capturedDotIds: [],
    };
  }

  const [a, b, c, d] = selectedDots;

  // Check 6 pairwise distances
  const distances = [
    distance3D(a, b),
    distance3D(a, c),
    distance3D(a, d),
    distance3D(b, c),
    distance3D(b, d),
    distance3D(c, d),
  ];

  const minDistance = Math.min(...distances);
  if (minDistance < MIN_DOT_DISTANCE) {
    return {
      isValid: false,
      volume: 0,
      minDistance,
      reason: `Dots are too close (min dist ${minDistance.toFixed(1)} < ${MIN_DOT_DISTANCE.toFixed(1)} units)`,
      capturedDotIds: [],
    };
  }

  const volume = calculateTetrahedronVolume(a, b, c, d);
  if (volume < MIN_TETRAHEDRON_VOLUME) {
    return {
      isValid: false,
      volume,
      minDistance,
      reason: `Volume too small / near-coplanar (${volume.toFixed(1)} < ${MIN_TETRAHEDRON_VOLUME.toFixed(1)} cu units)`,
      capturedDotIds: [],
    };
  }

  // Selected dot IDs set to avoid testing vertices themselves
  const selectedIds = new Set(selectedDots.map((dot) => dot.id));

  // Find all active dots strictly inside the tetrahedron
  // Rule: "Owned dots: Cannot be selected or destroyed by the owner; can be destroyed by the opponent's blink"
  const capturedDotIds: number[] = [];

  for (const dot of allDots) {
    if (dot.state !== 'active') continue;
    if (selectedIds.has(dot.id)) continue;

    // A player's own territory cannot be destroyed by the owner
    if (dot.owner === currentPlayer) continue;

    if (isPointInsideTetrahedron(dot, a, b, c, d)) {
      capturedDotIds.push(dot.id);
    }
  }

  return {
    isValid: true,
    volume,
    minDistance,
    capturedDotIds,
  };
}

/**
 * Generate roughly spherical cloud of ~120 dots, denser at core, sparser at edges,
 * with organic anisotropic stretch and minimum spacing so no two dots overlap.
 */
export function generateDotCloud(count = TOTAL_DOT_COUNT): DotData[] {
  const dots: DotData[] = [];
  const minSeparation = 2.4; // minimum distance between any 2 generated dots
  let attempts = 0;
  const maxAttempts = 15000;

  while (dots.length < count && attempts < maxAttempts) {
    attempts++;

    // Density falloff: r = R * u^(0.45) makes core denser than uniform sphere
    const u = Math.random();
    const r = CLOUD_RADIUS * Math.pow(u, 0.45);

    // Uniform random direction on sphere
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    // Slight organic ellipsoidal distortion and gentle perlin-like stretch
    const stretchX = 1.15;
    const stretchY = 0.88;
    const stretchZ = 1.08;

    const x = r * Math.sin(phi) * Math.cos(theta) * stretchX;
    const y = r * Math.sin(phi) * Math.sin(theta) * stretchY;
    const z = r * Math.cos(phi) * stretchZ;

    // Check minimum separation from already accepted dots
    const candidate = { x, y, z };
    let tooClose = false;
    for (const d of dots) {
      if (distance3D(candidate, d) < minSeparation) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      dots.push({
        id: dots.length + 1,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        z: Number(z.toFixed(2)),
        owner: 'neutral',
        state: 'active',
      });
    }
  }

  return dots;
}

/**
 * Checks whether any geometrically valid tetrahedron is physically possible
 * among the remaining neutral active dots.
 */
export function checkAnyValidTetrahedronExists(allDots: DotData[]): boolean {
  const neutralDots = allDots.filter(
    (d) => d.state === 'active' && d.owner === 'neutral'
  );

  if (neutralDots.length < 4) return false;

  const n = neutralDots.length;

  // If small count, test exhaustively
  if (n <= 16) {
    for (let i = 0; i < n - 3; i++) {
      for (let j = i + 1; j < n - 2; j++) {
        if (distance3D(neutralDots[i], neutralDots[j]) < MIN_DOT_DISTANCE) continue;
        for (let k = j + 1; k < n - 1; k++) {
          if (
            distance3D(neutralDots[i], neutralDots[k]) < MIN_DOT_DISTANCE ||
            distance3D(neutralDots[j], neutralDots[k]) < MIN_DOT_DISTANCE
          ) {
            continue;
          }
          for (let l = k + 1; l < n; l++) {
            const [a, b, c, d] = [
              neutralDots[i],
              neutralDots[j],
              neutralDots[k],
              neutralDots[l],
            ];
            if (
              distance3D(a, d) >= MIN_DOT_DISTANCE &&
              distance3D(b, d) >= MIN_DOT_DISTANCE &&
              distance3D(c, d) >= MIN_DOT_DISTANCE
            ) {
              const vol = calculateTetrahedronVolume(a, b, c, d);
              if (vol >= MIN_TETRAHEDRON_VOLUME) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  // For larger sets, perform heavy stochastic sampling (1200 random 4-tuples)
  // If no combination out of 1200 samples works, try systematic nearby pairs
  for (let sample = 0; sample < 1200; sample++) {
    const idx0 = Math.floor(Math.random() * n);
    let idx1 = Math.floor(Math.random() * n);
    let idx2 = Math.floor(Math.random() * n);
    let idx3 = Math.floor(Math.random() * n);

    if (idx1 === idx0 || idx2 === idx0 || idx3 === idx0) continue;
    if (idx2 === idx1 || idx3 === idx1 || idx3 === idx2) continue;

    const [a, b, c, d] = [
      neutralDots[idx0],
      neutralDots[idx1],
      neutralDots[idx2],
      neutralDots[idx3],
    ];

    if (
      distance3D(a, b) >= MIN_DOT_DISTANCE &&
      distance3D(a, c) >= MIN_DOT_DISTANCE &&
      distance3D(a, d) >= MIN_DOT_DISTANCE &&
      distance3D(b, c) >= MIN_DOT_DISTANCE &&
      distance3D(b, d) >= MIN_DOT_DISTANCE &&
      distance3D(c, d) >= MIN_DOT_DISTANCE
    ) {
      if (calculateTetrahedronVolume(a, b, c, d) >= MIN_TETRAHEDRON_VOLUME) {
        return true;
      }
    }
  }

  return false;
}

/**
 * AI Move Generator: Finds a good move for AI or hint system.
 * Evaluates candidates based on:
 * - Number of captured opponent dots (huge bonus!)
 * - Number of captured neutral dots
 * - Avoids wasting turns with 0 captures unless forced
 */
export function findBestMove(
  allDots: DotData[],
  aiPlayer: PlayerId,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): DotData[] | null {
  const neutralDots = allDots.filter(
    (d) => d.state === 'active' && d.owner === 'neutral'
  );
  if (neutralDots.length < 4) return null;

  const opponent: PlayerId = aiPlayer === 'player1' ? 'player2' : 'player1';
  const candidates: { dots: DotData[]; score: number; captured: number }[] = [];

  const maxSamples = difficulty === 'hard' ? 1800 : difficulty === 'medium' ? 800 : 300;
  const n = neutralDots.length;

  for (let s = 0; s < maxSamples; s++) {
    const idx0 = Math.floor(Math.random() * n);
    const idx1 = Math.floor(Math.random() * n);
    const idx2 = Math.floor(Math.random() * n);
    const idx3 = Math.floor(Math.random() * n);

    if (idx0 === idx1 || idx0 === idx2 || idx0 === idx3) continue;
    if (idx1 === idx2 || idx1 === idx3 || idx2 === idx3) continue;

    const selected = [neutralDots[idx0], neutralDots[idx1], neutralDots[idx2], neutralDots[idx3]];
    const validation = validateTetrahedron(selected, allDots, aiPlayer);

    if (validation.isValid) {
      let score = 0;
      let oppCaptured = 0;

      for (const id of validation.capturedDotIds) {
        const dot = allDots.find((d) => d.id === id);
        if (dot?.owner === opponent) {
          oppCaptured++;
          score += 2.5; // High value on destroying enemy territory!
        } else {
          score += 1.0;
        }
      }

      // If easy AI, add randomness
      if (difficulty === 'easy') {
        score += (Math.random() - 0.5) * 3;
      }

      candidates.push({
        dots: selected,
        score,
        captured: validation.capturedDotIds.length,
      });

      // Quick return if outstanding move found on hard
      if (difficulty === 'hard' && validation.capturedDotIds.length >= 6) {
        return selected;
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // If hard, pick highest. If medium, pick from top 3. If easy, pick from top 10.
  if (difficulty === 'hard') {
    return candidates[0].dots;
  } else if (difficulty === 'medium') {
    const pick = Math.floor(Math.random() * Math.min(3, candidates.length));
    return candidates[pick].dots;
  } else {
    const pick = Math.floor(Math.random() * Math.min(10, candidates.length));
    return candidates[pick].dots;
  }
}
