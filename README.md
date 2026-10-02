# Anything and nothing

The source for [thans.biz](https://www.thans.biz), built with Jekyll 3 and Minima. The Gemfile lists the site plugins directly so local builds only install packages the site uses.

## Local setup

Install Ruby 3.3, Bundler, Node.js 22, Python 3, and Chromium for Playwright. The repository's `.ruby-version` and `Gemfile` specify the supported Ruby version.

```sh
bundle install
npm ci
npx playwright install chromium
```

Build and check the site:

```sh
JEKYLL_ENV=production bundle exec jekyll build
bundle exec ruby scripts/validate_site.rb _site
npm test
npx --yes @lhci/cli@0.15.x autorun --config=lighthouserc.json
```

Playwright serves the generated `_site` directory on port 41738 during `npm test`. Run the Jekyll build before the browser tests. For local editing, use `bundle exec jekyll serve` and open `http://localhost:4000`.

## Content

Posts live in `_posts/` and use front matter for titles, dates, tags, excerpts, and permalinks. Set `image` on a post to override the default social sharing image. Add images to `assets/` and link them with `relative_url` so local and hosted URLs both work.

## Contact

Nathan Collins — [Mastodon](https://infosec.exchange/@figcatchingraptor) · [GitHub](https://github.com/Scarthan) · [X](https://twitter.com/3DG_NCollins) · N@thans.biz
