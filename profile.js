const paper = false;
const concept = paper ? 'Paper' : 'Graphite';
document.body.innerHTML = `
<nav class="review-bar" aria-label="Preview controls"><a href="index.html">← Workshop</a><strong>${concept}</strong><a href="game/index.html">Game</a><span>README layout study</span></nav>
<div class="layout"><aside class="identity"><div class="avatar" aria-hidden="true">RF</div><h1>ROGFOG</h1><p class="username">ROGFOG</p><p>Python · TypeScript<br>PolicyLens · FileSentinel · RepoCards</p><p class="note">The monogram is a placeholder for this layout study. Your GitHub avatar stays separate from the README.</p></aside>
<main class="readme"><div class="filename"><b>ROGFOG</b> / README.md</div>
<img src="assets/header-${paper ? 'paper' : 'signal'}.svg" alt="ROGFOG. Python and TypeScript.">
<p class="intro">Tools for reviewing security headers, comparing files and presenting repositories. Built with Python and TypeScript.</p>
<h2>Signal Route</h2><a href="game/index.html${paper ? '?theme=paper' : ''}" aria-label="Play Signal Route"><img src="assets/signal-preview.svg" alt="Signal Route: rotate the tiles and connect the signal. Open the game below."></a>
<p class="links"><a href="game/index.html${paper ? '?theme=paper' : ''}">Play</a><span>·</span><a href="how-it-works.html#game">How it works</a></p>
<h2>Selected projects</h2>
<section aria-label="Selected projects">
<article class="project"><div class="project-tag">01 / TYPESCRIPT / BROWSER</div><h3>PolicyLens</h3><img class="project-preview" src="assets/policylens-preview.svg" alt="PolicyLens result example"><p>Review Content Security Policy and HTTP response headers. Processing stays in your browser.</p><div class="links"><a href="https://rogfog.github.io/PolicyLens/">Open workbench ↗</a></div></article>
<article class="project"><div class="project-tag">02 / PYTHON / COMMAND LINE</div><h3>FileSentinel</h3><img class="project-preview" src="assets/filesentinel-preview.svg" alt="FileSentinel result example"><p>Save a directory's SHA-256 snapshot. Compare it later to find added, removed and changed files. Standard library only.</p><div class="links"><a href="https://github.com/ROGFOG/FileSentinel#quick-start">Quick start ↗</a></div></article>
<article class="project"><div class="project-tag">03 / TYPESCRIPT / SVG</div><h3>RepoCards</h3><img class="project-preview" src="assets/repocards-preview.svg" alt="RepoCards result example"><p>Turn public GitHub repository metadata into downloadable SVG cards. Choose a palette and keep the result in your README.</p><div class="links"><a href="https://rogfog.github.io/RepoCards/">Make a card ↗</a></div></article>
</section><h2>Build notes</h2><section class="howbuilt"><h3>Profile Workshop</h3><p>How the header and game work, with instructions for adapting them.</p><p class="links"><a href="how-it-works.html">Read the build notes</a><span>·</span><a href="game/index.html${paper ? '?theme=paper' : ''}">Try the game</a></p></section>
<h2>Stack</h2><div class="skills" aria-label="Technologies"><code>Python</code><code>TypeScript</code><code>GitHub Actions</code><code>SVG</code></div>
<details><summary>Technical details</summary><p><a href="https://github.com/ROGFOG/ProfileWorkshop">Profile Workshop source</a> · <a href="https://github.com/ROGFOG/PolicyLens">PolicyLens</a> · <a href="https://github.com/ROGFOG/FileSentinel">FileSentinel</a> · <a href="https://github.com/ROGFOG/RepoCards">RepoCards</a></p><p>This is an HTML layout study for a GitHub README. The final profile uses Markdown and SVG images; the game runs on a separate page. Use the Markdown and images in the profile folder for the actual README.</p></details>
<footer class="footnote"><a href="how-it-works.html#credits">Components &amp; licenses</a></footer>
</main></div><footer class="page-end">Layout concept ${paper ? '02' : '01'} / ${concept}</footer>`;
