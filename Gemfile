source "https://rubygems.org"

# Keep local builds on the Ruby 3.3 version used in CI.
ruby "~> 3.3.0"

# Use the Jekyll and theme versions provided by the current GitHub Pages build.
# The site does not use remote themes, so it does not need jekyll-remote-theme.
gem "jekyll", "~> 3.10.0"
gem "minima", "~> 2.5"
gem "kramdown-parser-gfm", "~> 1.1"
gem "nokogiri", "~> 1.19.4", group: :test # Used by scripts/validate_site.rb.
gem "jekyll-feed", "~> 0.17", group: :jekyll_plugins
gem "jekyll-paginate", "~> 1.1", group: :jekyll_plugins
gem "jekyll-seo-tag", "~> 2.8", group: :jekyll_plugins
gem "jekyll-sitemap", "~> 1.4", group: :jekyll_plugins

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", platforms: [:windows]
gem "webrick", "~> 1.8"
