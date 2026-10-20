const concept = 'Graphite';
document.body.innerHTML = `
<nav class="review-bar" aria-label="Preview controls"><a href="index.html">← Workshop</a><strong>${concept}</strong><a href="game/index.html">Game</a><span>README layout study</span></nav>
<div class="layout"><aside class="identity"><div class="avatar" aria-hidden="true">RF</div><h1>ROGFOG</h1><p class="username">ROGFOG</p><p>Python · TypeScript<br>PolicyLens · FileSentinel · RepoCards</p><p class="note">The monogram is a placeholder for this layout study. Your GitHub avatar stays separate from the README.</p></aside>
<main class="readme"><div class="filename"><b>ROGFOG</b> / README.md</div>
<img src="assets/header-signal.svg" alt="ROGFOG. Python and TypeScript.">
<p class="intro">PolicyLens reviews CSP headers, FileSentinel compares directory snapshots, and RepoCards saves GitHub metadata as SVG. Signal Route runs in the browser.</p>
<h2>Signal Route</h2><a href="game/index.html" aria-label="Play Signal Route"><img src="assets/signal-preview.svg" alt="Signal Route: rotate the tiles and connect the signal. Open the game below."></a>
<p class="links"><a href="game/index.html">Play</a><span>·</span><a href="how-it-works.html#game">How it works</a></p>
<h2>Projects and current limits</h2>
<section aria-label="Projects and current limits">
<article class="project"><div class="project-tag">01 / TYPESCRIPT / BROWSER</div><h3>PolicyLens</h3><img class="project-preview" src="assets/policylens-preview.svg" alt="PolicyLens result example"><p>Review CSP fallbacks and response headers in the browser. Comma-separated policy lists are currently skipped.</p><div class="links"><a href="https://rogfog.github.io/PolicyLens/">Open workbench ↗</a></div></article>
<article class="project"><div class="project-tag">02 / PYTHON / COMMAND LINE</div><h3>FileSentinel</h3><img class="project-preview" src="assets/filesentinel-preview.svg" alt="FileSentinel result example"><p>Compare directory snapshots with SHA-256. Content changes are covered; permissions and alternate data streams are outside the format.</p><div class="links"><a href="https://github.com/ROGFOG/FileSentinel#quick-start">Quick start ↗</a></div></article>
<article class="project"><div class="project-tag">03 / TYPESCRIPT / SVG</div><h3>RepoCards</h3><img class="project-preview" src="assets/repocards-preview.svg" alt="RepoCards result example"><p>Download public GitHub metadata as SVG. Cards keep their capture time; refresh by generating a new image.</p><div class="links"><a href="https://rogfog.github.io/RepoCards/">Make a card ↗</a></div></article>
</section><h2>Build notes</h2><section class="howbuilt"><h3>Profile Workshop</h3><p>Source notes for the SVG header, classic circuits and growing endless mode.</p><p class="links"><a href="how-it-works.html">Read the build notes</a><span>·</span><a href="game/index.html">Try the game</a></p></section>
<h2>Stack</h2><div class="skills" aria-label="Technologies"><code>Python</code><code>TypeScript</code><code>GitHub Actions</code><code>SVG</code></div>
<details><summary>Technical details</summary><p><a href="https://github.com/ROGFOG/ProfileWorkshop">Profile Workshop source</a> · <a href="https://github.com/ROGFOG/PolicyLens">PolicyLens</a> · <a href="https://github.com/ROGFOG/FileSentinel">FileSentinel</a> · <a href="https://github.com/ROGFOG/RepoCards">RepoCards</a></p><p>This is an HTML layout study for a GitHub README. The final profile uses Markdown and SVG images; the game runs on a separate page. Use the Markdown and images in the profile folder for the actual README.</p></details>

</main></div><footer class="page-end">Layout concept 01 / ${concept}</footer>`;
