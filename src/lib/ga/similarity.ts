/**
 * High-level similarity API — findSimilar() for single items and
 * selections, in both fast and deep (GA) modes.
 *
 * See docs/plans/SIMILAR_ITEMS.md and docs/plans/CORE_GENETIC_ALGORITHM.md.
 */

import type { Item } from '$lib/types';
import { fitness, toVector, uniformWeights, weightedDistance } from './distance';
import { runGA, runGAWithNegatives } from './engine';
import type { SimilarityOptions, SimilarityResult, WeightVector } from './types';

/**
 * Computes the mean (element-wise) of multiple genome vectors — the
 * "target profile" for a selection of items.
 *
 * @param vectors - The genome vectors to average.
 * @returns The mean vector.
 */
function meanVector(vectors: number[][]): number[] {
	if (vectors.length === 0) return [];
	const length = vectors[0].length;
	const result = new Array(length).fill(0);
	for (const v of vectors) {
		for (let i = 0; i < length; i++) {
			result[i] += v[i];
		}
	}
	for (let i = 0; i < length; i++) {
		result[i] /= vectors.length;
	}
	return result;
}

/**
 * Extracts the attribute id order from an item's average ratings.
 * Falls back to the type's attribute order if provided.
 *
 * @param item - The item whose attribute order to extract.
 * @returns The ordered attribute ids.
 */
function attributeOrder(item: Item): string[] {
	return Object.keys(item.averageRatings);
}

/**
 * Finds items similar to a single target item.
 *
 * @param target - The item to find matches for.
 * @param candidates - All other items in the same type (excluding target).
 * @param options - Similarity options (mode: 'fast' | 'ga').
 * @returns Ranked similarity results (highest score first).
 */
export function findSimilar(
	target: Item,
	candidates: Item[],
	options?: SimilarityOptions
): SimilarityResult[] {
	const mode = options?.mode ?? 'fast';
	const order = attributeOrder(target);
	const targetVector = toVector(target.averageRatings, order);

	if (candidates.length === 0 || order.length === 0) return [];

	if (mode === 'fast') {
		const weights = uniformWeights(order.length);
		return rankCandidates(targetVector, candidates, order, weights);
	}

	// Deep (GA) mode: evolve weights, then rank
	const candidateVectors = candidates.map((c) => toVector(c.averageRatings, order));
	const gaResult = runGA(targetVector, candidateVectors, options?.gaOptions);
	return rankCandidates(targetVector, candidates, order, gaResult.bestWeights);
}

/**
 * Finds items similar to a selection of items (multi-item similarity).
 * The target is the mean vector of the selected items; in GA mode,
 * negative sampling is used (non-selected items are negatives).
 *
 * @param selection - The selected items to find matches for.
 * @param allItems - All items in the type (including the selection).
 * @param options - Similarity options.
 * @returns Ranked similarity results (excluding the selected items).
 */
export function findSimilarSelection(
	selection: Item[],
	allItems: Item[],
	options?: SimilarityOptions
): SimilarityResult[] {
	const mode = options?.mode ?? 'fast';
	if (selection.length === 0 || allItems.length === 0) return [];

	const order = attributeOrder(selection[0]);
	const selectionIds = new Set(selection.map((i) => i.id));
	const candidates = allItems.filter((i) => !selectionIds.has(i.id));
	if (candidates.length === 0 || order.length === 0) return [];

	const selectionVectors = selection.map((i) => toVector(i.averageRatings, order));
	const targetVector = meanVector(selectionVectors);

	if (mode === 'fast') {
		const weights = uniformWeights(order.length);
		return rankCandidates(targetVector, candidates, order, weights);
	}

	// Deep (GA) mode with negative sampling
	const candidateVectors = candidates.map((c) => toVector(c.averageRatings, order));
	const gaResult = runGAWithNegatives(
		targetVector,
		candidateVectors,
		selectionVectors,
		options?.gaOptions
	);
	return rankCandidates(targetVector, candidates, order, gaResult.bestWeights);
}

/**
 * Ranks candidates by similarity to the target under the given weights.
 *
 * @param targetVector - The target genome vector.
 * @param candidates - The candidate items.
 * @param order - The attribute id order.
 * @param weights - The weight vector.
 * @returns Ranked results (highest score first).
 */
function rankCandidates(
	targetVector: number[],
	candidates: Item[],
	order: string[],
	weights: WeightVector
): SimilarityResult[] {
	return candidates
		.map((candidate) => {
			const candidateVector = toVector(candidate.averageRatings, order);
			const score = fitness(targetVector, candidateVector, weights);
			return { itemId: candidate.id, score };
		})
		.sort((a, b) => b.score - a.score);
}

/**
 * Computes the weighted distance between two items directly (for
 * debugging/display purposes).
 *
 * @param a - First item.
 * @param b - Second item.
 * @param weights - Optional weight vector (defaults to uniform).
 * @returns The weighted distance.
 */
export function distanceBetween(
	a: Item,
	b: Item,
	weights?: WeightVector
): number {
	const order = attributeOrder(a);
	const aVec = toVector(a.averageRatings, order);
	const bVec = toVector(b.averageRatings, order);
	const w = weights ?? uniformWeights(order.length);
	return weightedDistance(aVec, bVec, w);
}
