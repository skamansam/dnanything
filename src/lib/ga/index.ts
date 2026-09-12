/**
 * Public API for the genetic algorithm engine.
 *
 * See docs/plans/CORE_GENETIC_ALGORITHM.md and docs/plans/SIMILAR_ITEMS.md.
 */

export { weightedDistance, fitness, toVector, uniformWeights } from './distance';
export { runGA, runGAWithNegatives, type GAResult } from './engine';
export { findSimilar, findSimilarSelection, distanceBetween } from './similarity';
export type {
	Genome,
	GenomeVector,
	WeightVector,
	AttributeOrder,
	GAOptions,
	SimilarityResult,
	SimilarityMode,
	SimilarityOptions,
	GAProgressMessage,
	GAResultMessage,
	GAWorkerMessage
} from './types';
export { DEFAULT_GA_OPTIONS } from './types';
