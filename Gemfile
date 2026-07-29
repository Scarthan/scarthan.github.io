source "https://rubygems.org"

# GitHub Pages 232 includes native dependencies that do not support Ruby 4.
ruby "~> 3.3.0"

# Match the dependency set used by GitHub Pages.
gem "github-pages", "~> 232", group: :jekyll_plugins
gem "minima", "~> 2.5"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", platforms: [:windows]
gem "webrick", "~> 1.8"
