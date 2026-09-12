/**
 * The genetic algorithm engine — evolves a weight vector to maximize
 * fitness against a target genome.
 *
 * Pure, framework-agnostic TypeScript. Uses a seeded PRNG for deterministic
 * test runs. See docs/plans/CORE_GENETIC_ALGORITHM.md.
 */

import {
	DEFAULT_GA_OPTIONS,
	type GAOptions,
	type GenomeVector,
	type WeightVector
} from './types';
import { fitness } from './distance';

/**
 * Mulberry32 — a fast, seedable PRNG. Returns a function producing
 * floats in [0, 1).
 *
 * @param seed - The PRNG seed.
 * @returns A function that returns the next random float in [0, 1).
 */
function mulberry32(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** A scored individual in the population. */
interface Individual {
	weights: WeightVector;
	score: number;
}

/**
 * Creates a random weight vector with values in [0, 1].
 *
 * @param rng - The PRNG function.
 * @param length - Number of attributes.
 * @returns A random weight vector.
 */
function randomWeights(rng: () => number, length: number): WeightVector {
	return Array.from({ length }, () => rng());
}

/**
 * Tournament selection: pick `tournamentSize` random individuals and
 * return the one with the best score.
 *
 * @param rng - The PRNG function.
 * @param population - The current population.
 * @param tournamentSize - Number of competitors.
 * @returns The winning individual.
 */
function tournamentSelect(
	rng: () => number,
	population: Individual[],
	tournamentSize: number
): Individual {
	let best: Individual | null = null;
	for (let i = 0; i < tournamentSize; i++) {
		const candidate = population[Math.floor(rng() * population.length)];
		if (best === null || candidate.score > best.score) {
			best = candidate;
		}
	}
	return best ?? population[0];
}

/**
 * Uniform crossover: each gene is taken from either parent with 50% prob.
 *
 * @param rng - The PRNG function.
 * @param a - First parent.
 * @param b - Second parent.
 * @returns The offspring weight vector.
 */
function crossover(rng: () => number, a: WeightVector, b: WeightVector): WeightVector {
	return a.map((wa, i) => (rng() < 0.5 ? wa : b[i]));
}

/**
 * Gaussian mutation: perturb each gene with probability `mutationRate`.
 *
 * @param rng - The PRNG function.
 * @param weights - The weight vector to mutate.
 * @param mutationRate - Per-gene mutation probability.
 * @param sigma - Standard deviation of the Gaussian perturbation.
 * @returns A new mutated weight vector (clamped to [0, 1]).
 */
function mutate(
	rng: () => number,
	weights: WeightVector,
	mutationRate: number,
	sigma: number
): WeightVector {
	return weights.map((w) => {
		if (rng() < mutationRate) {
			// Box-Muller transform for Gaussian noise
			const u1 = Math.max(rng(), 1e-10);
			const u2 = rng();
			const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
			return Math.max(0, Math.min(1, w + gaussian * sigma));
		}
		return w;
	});
}

/** The result of running the GA. */
export interface GAResult {
	/** The best weight vector found. */
	bestWeights: WeightVector;
	/** The best fitness achieved. */
	bestFitness: number;
	/** Fitness history per generation (best in each generation). */
	history: number[];
}

/**
 * Runs the genetic algorithm to evolve a weight vector that maximizes
 * the fitness of `target` against a set of `candidates`.
 *
 * Fitness is the average fitness of the target against all candidates
 * under the given weights — i.e. weights that make all candidates appear
 * similar to the target are favored. For selection-based similarity
 * (negative sampling), use `runGAWithNegatives()`.
 *
 * @param target - The target genome vector.
 * @param candidates - The candidate genome vectors to match against.
 * @param options - GA tuning options.
 * @returns The best weights, fitness, and history.
 */
export function runGA(
	target: GenomeVector,
	candidates: GenomeVector[],
	options?: GAOptions
): GAResult {
	const opts = { ...DEFAULT_GA_OPTIONS, ...options };
	const rng = mulberry32(opts.seed);
	const attrCount = target.length;

	if (attrCount === 0 || candidates.length === 0) {
		return {
			bestWeights: uniformWeights(attrCount),
			bestFitness: 0,
			history: []
		};
	}

	// Initialize population: mix of uniform and random weights
	const population: Individual[] = [];
	population.push({
		weights: uniformWeights(attrCount),
		score: evaluatePopulation(target, candidates, uniformWeights(attrCount))
	});
	for (let i = 1; i < opts.populationSize; i++) {
		const weights = randomWeights(rng, attrCount);
		population.push({ weights, score: evaluatePopulation(target, candidates, weights) });
	}

	const history: number[] = [];

	for (let gen = 0; gen < opts.generations; gen++) {
		// Sort by score descending
		population.sort((a, b) => b.score - a.score);
		history.push(population[0].score);

		// Elitism: carry forward the best individuals
		const next: Individual[] = population.slice(0, opts.elitismCount);

		// Breed the rest
		while (next.length < opts.populationSize) {
			const parent1 = tournamentSelect(rng, population, opts.tournamentSize);
			const parent2 = tournamentSelect(rng, population, opts.tournamentSize);
			const childWeights = mutate(
				rng,
				crossover(rng, parent1.weights, parent2.weights),
				opts.mutationRate,
				opts.mutationSigma
			);
			next.push({
				weights: childWeights,
				score: evaluatePopulation(target, candidates, childWeights)
			});
		}

		population.length = 0;
		population.push(...next);
	}

	population.sort((a, b) => b.score - a.score);
	history.push(population[0].score);

	return {
		bestWeights: population[0].weights,
		bestFitness: population[0].score,
		history
	};
}

/**
 * Evaluates a weight vector: average fitness of the target against all
 * candidates under the given weights.
 */
function evaluatePopulation(
	target: GenomeVector,
	candidates: GenomeVector[],
	weights: WeightVector
): number {
	let sum = 0;
	for (const candidate of candidates) {
		sum += fitness(target, candidate, weights);
	}
	return sum / candidates.length;
}

/**
 * Runs the GA with negative sampling: fitness favors candidates close to
 * the target AND far from the negative examples. Used for selection-based
 * similarity (see docs/plans/SIMILAR_ITEMS.md).
 *
 * @param target - The target (mean of selected items).
 * @param positives - Candidate genome vectors to rank.
 * @param negatives - Genome vectors of items outside the selection.
 * @param options - GA tuning options.
 * @returns The best weights, fitness, and history.
 */
export function runGAWithNegatives(
	target: GenomeVector,
	positives: GenomeVector[],
	negatives: GenomeVector[],
	options?: GAOptions
): GAResult {
	const opts = { ...DEFAULT_GA_OPTIONS, ...options };
	const rng = mulberry32(opts.seed);
	const attrCount = target.length;

	if (attrCount === 0 || positives.length === 0) {
		return { bestWeights: uniformWeights(attrCount), bestFitness: 0, history: [] };
	}

	const population: Individual[] = [];
	population.push({
		weights: uniformWeights(attrCount),
		score: evaluateWithNegatives(target, positives, negatives, uniformWeights(attrCount))
	});
	for (let i = 1; i < opts.populationSize; i++) {
		const weights = randomWeights(rng, attrCount);
		population.push({
			weights,
			score: evaluateWithNegatives(target, positives, negatives, weights)
		});
	}

	const history: number[] = [];

	for (let gen = 0; gen < opts.generations; gen++) {
		population.sort((a, b) => b.score - a.score);
		history.push(population[0].score);

		const next: Individual[] = population.slice(0, opts.elitismCount);
		while (next.length < opts.populationSize) {
			const parent1 = tournamentSelect(rng, population, opts.tournamentSize);
			const parent2 = tournamentSelect(rng, population, opts.tournamentSize);
			const childWeights = mutate(
				rng,
				crossover(rng, parent1.weights, parent2.weights),
				opts.mutationRate,
				opts.mutationSigma
			);
			next.push({
				weights: childWeights,
				score: evaluateWithNegatives(target, positives, negatives, childWeights)
			});
		}
		population.length = 0;
		population.push(...next);
	}

	population.sort((a, b) => b.score - a.score);
	history.push(population[0].score);

	return {
		bestWeights: population[0].weights,
		bestFitness: population[0].score,
		history
	};
}

/**
 * Fitness with negative sampling: average positive fitness minus average
 * negative fitness (clamped to >= 0).
 */
function evaluateWithNegatives(
	target: GenomeVector,
	positives: GenomeVector[],
	negatives: GenomeVector[],
	weights: WeightVector
): number {
	let posSum = 0;
	for (const p of positives) {
		posSum += fitness(target, p, weights);
	}
	const posAvg = posSum / positives.length;

	if (negatives.length === 0) return posAvg;

	let negSum = 0;
	for (const n of negatives) {
		negSum += fitness(target, n, weights);
	}
	const negAvg = negSum / negatives.length;

	return Math.max(0, posAvg - negAvg);
}

/** Re-exported helper for the engine module. */
function uniformWeights(length: number): WeightVector {
	return new Array(length).fill(1);
}
