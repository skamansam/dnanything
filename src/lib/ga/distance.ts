/**
 * Weighted distance and fitness functions for the genetic algorithm.
 *
 * See docs/plans/CORE_GENETIC_ALGORITHM.md.
 */

import type { GenomeVector, WeightVector } from './types';

/**
 * Computes the weighted Euclidean distance between two genome vectors.
 *
 * @param a - First genome vector.
 * @param b - Second genome vector (same length as a).
 * @param weights - Per-attribute weights in [0, 1] (same length as a).
 * @returns The weighted distance (0 = identical).
 */
export function weightedDistance(
	a: GenomeVector,
	b: GenomeVector,
	weights: WeightVector
): number {
	if (a.length !== b.length || a.length !== weights.length) {
		throw new Error(
			`Vector length mismatch: a=${a.length}, b=${b.length}, weights=${weights.length}`
		);
	}
	let sum = 0;
	for (let i = 0; i < a.length; i++) {
		const diff = a[i] - b[i];
		sum += weights[i] * diff * diff;
	}
	return Math.sqrt(sum);
}

/**
 * Computes fitness: 1 / (1 + distance). Higher = more similar.
 *
 * @param target - The target genome vector.
 * @param candidate - The candidate genome vector.
 * @param weights - Per-attribute weights.
 * @returns Fitness score in (0, 1].
 */
export function fitness(
	target: GenomeVector,
	candidate: GenomeVector,
	weights: WeightVector
): number {
	const dist = weightedDistance(target, candidate, weights);
	return 1 / (1 + dist);
}

/**
 * Converts a genome (attribute id -> value map) to an ordered vector.
 *
 * @param genome - The genome map.
 * @param order - The attribute id order.
 * @returns The ordered numeric vector.
 */
export function toVector(genome: Record<string, number>, order: string[]): GenomeVector {
	return order.map((id) => genome[id] ?? 0);
}

/**
 * Creates a uniform weight vector (all weights equal).
 *
 * @param length - Number of attributes.
 * @returns A weight vector of the given length with all values = 1.
 */
export function uniformWeights(length: number): WeightVector {
	return new Array(length).fill(1);
}
