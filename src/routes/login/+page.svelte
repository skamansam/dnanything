<script lang="ts">
	import { Button } from 'twintrinsic';
	import DnaAnythingLogo from '$lib/components/DnaAnythingLogo.svelte';

	let email = $state('');
	let loading = $state(false);
	let mode = $state<'signin' | 'signup'>('signin');

	function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		// TODO: wire to Supabase Auth (email magic link)
		setTimeout(() => {
			loading = false;
		}, 1000);
	}

	function handleGitHub() {
		// TODO: wire to Supabase Auth (GitHub OAuth)
		console.log('GitHub OAuth');
	}
</script>

<svelte:head>
	<title>Sign In — DNAnything</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-6 py-12">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="flex justify-center mb-8">
			<DnaAnythingLogo size={48} variant="long" />
		</div>

		<!-- Header -->
		<div class="text-center mb-8">
			<p class="text-xs uppercase tracking-widest text-muted mb-2">§ {mode === 'signin' ? 'Sign In' : 'Create Account'}</p>
			<h1 class="text-2xl font-bold mb-2">
				{mode === 'signin' ? 'Welcome back' : 'Join the catalog'}
			</h1>
			<p class="text-sm text-muted">
				{mode === 'signin'
					? 'Sign in to rate, review, and contribute to the catalog.'
					: 'Create an account to start contributing types, items, and ratings.'}
			</p>
		</div>

		<!-- GitHub OAuth -->
		<button
			type="button"
			onclick={handleGitHub}
			class="w-full px-4 py-3 rounded-lg border border-border bg-surface font-medium hover:bg-hover transition-colors flex items-center justify-center gap-3 mb-6"
		>
			<iconify-icon icon="mdi:github" class="text-xl"></iconify-icon>
			Continue with GitHub
		</button>

		<!-- Divider -->
		<div class="flex items-center gap-4 mb-6">
			<div class="flex-1 border-t border-border"></div>
			<span class="text-xs text-muted uppercase tracking-wider">or</span>
			<div class="flex-1 border-t border-border"></div>
		</div>

		<!-- Email magic link form -->
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div>
				<label for="email" class="block text-sm font-medium mb-1.5">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					class="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<p class="text-xs text-muted mt-1.5">
					We'll send you a magic link to sign in. No password required.
				</p>
			</div>

			<Button type="submit" variant="primary" disabled={loading} class="w-full">
				{loading ? 'Sending...' : mode === 'signin' ? 'Send Magic Link' : 'Create Account'}
			</Button>
		</form>

		<!-- Toggle mode -->
		<p class="text-center text-sm text-muted mt-6">
			{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
			<button
				type="button"
				onclick={() => mode = mode === 'signin' ? 'signup' : 'signin'}
				class="text-primary hover:underline font-medium"
			>
				{mode === 'signin' ? 'Sign up' : 'Sign in'}
			</button>
		</p>

		<!-- Privacy note -->
		<p class="text-center text-xs text-muted mt-8 max-w-xs mx-auto">
			By signing in, you agree to our
			<a href="/contribute" class="text-primary hover:underline">privacy policy</a>.
			We use Supabase Auth and do not store your password.
		</p>
	</div>
</div>
