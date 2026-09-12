/**
 * Genetic algorithm type definitions.
 *
 * See docs/plans/CORE_GENETIC_ALGORITHM.md for the full spec.
 */

/** An item's genome: its attribute rating vector, indexed by attribute id. */
export type Genome = Record<string, number>;

/** An ordered genome: the attribute vector in attribute order. */
export type GenomeVector = number[];

/** An evolvable weight vector expressing attribute importance. */
export type WeightVector = number[];

/** The ordered list of attribute ids that a genome/weight vector is indexed by. */
export type AttributeOrder = string[];

/** Options for the genetic algorithm. */
export interface GAOptions {
	/** Number of weight vectors in the population. */
	populationSize?: number;
	/** Maximum generations to run. */
	generations?: number;
	/** Per-gene probability of mutation. */
	mutationRate?: number;
	/** Number of elite individuals preserved each generation. */
	elitismCount?: number;
	/** Tournament size for parent selection. */
	tournamentSize?: number;
	/** Standard deviation of Gaussian mutation perturbation. */
	mutationSigma?: number;
	/** Seed for the PRNG (for deterministic tests). */
	seed?: number;
}

/** Default GA options. */
export const DEFAULT_GA_OPTIONS: Required<GAOptions> = {
	populationSize: 50,
	generations: 40,
	mutationRate: 0.1,
	elitismCount: 2,
	tournamentSize: 3,
	mutationSigma: 0.2,
	seed: 12345
};

/** A single candidate result from findSimilar(). */
export interface SimilarityResult {
	/** The item id. */
	itemId: string;
	/** Similarity score in [0, 1] (1 = identical). */
	score: number;
	/** The evolved weight vector (deep mode only). */
	weights?: WeightVector;
}

/** Mode for findSimilar(). */
export type SimilarityMode = 'fast' | 'ga';

/** Options for findSimilar(). */
export interface SimilarityOptions {
	mode?: SimilarityMode;
	gaOptions?: GAOptions;
}

/** Progress message from the GA worker. */
export interface GAProgressMessage {
	type: 'progress';
	generation: number;
	bestFitness: number;
}

/** Result message from the GA worker. */
export interface GAResultMessage {
	type: 'result';
	results: SimilarityResult[];
	weights: WeightVector;
}

/** Union of worker messages. */
export type GAWorkerMessage = GAProgressMessage | GAResultMessage;
