# frozen_string_literal: true

require "json"
require "nokogiri"
require "pathname"
require "uri"

site_root = Pathname(ARGV.fetch(0, "_site")).expand_path
errors = []

def local_target(site_root, page_path, raw_url)
  uri = URI.parse(raw_url)
  return nil if uri.scheme || raw_url.start_with?("//", "mailto:", "tel:")

  path = uri.path.to_s
  target = if path.empty?
             page_path
           elsif path.start_with?("/")
             site_root.join(path.delete_prefix("/"))
           else
             page_path.dirname.join(path)
           end

  target = target.cleanpath
  target = target.join("index.html") if target.directory?
  target = Pathname("#{target}.html") unless target.exist? || target.extname != ""
  [target, uri.fragment]
rescue URI::InvalidURIError
  nil
end

html_files = site_root.glob("**/*.html")
errors << "No generated HTML files found in #{site_root}" if html_files.empty?

html_files.each do |page_path|
  document = Nokogiri::HTML5(page_path.read)
  relative = page_path.relative_path_from(site_root)

  errors << "#{relative}: expected one <title>" unless document.css("title").length == 1
  errors << "#{relative}: expected one canonical link" unless document.css('link[rel="canonical"]').length == 1
  errors << "#{relative}: expected one <h1>" unless document.css("h1").length == 1

  document.css("img").each do |image|
    errors << "#{relative}: image is missing alt text" unless image.key?("alt")
  end

  document.css("[href], [src]").each do |element|
    raw_url = element["href"] || element["src"]
    next if raw_url.nil? || raw_url.empty? || raw_url.include?("{url}")

    resolved = local_target(site_root, page_path, raw_url)
    next unless resolved

    target, fragment = resolved
    unless target.exist?
      errors << "#{relative}: missing internal target #{raw_url}"
      next
    end

    next if fragment.nil? || fragment.empty? || target.extname != ".html"

    target_document = target == page_path ? document : Nokogiri::HTML5(target.read)
    unless target_document.css("[id]").any? { |node| node["id"] == fragment }
      errors << "#{relative}: missing fragment ##{fragment} in #{raw_url}"
    end
  end
end

begin
  JSON.parse(site_root.join("search.json").read)
rescue JSON::ParserError => e
  errors << "search.json: invalid JSON (#{e.message})"
rescue Errno::ENOENT
  errors << "search.json: file not generated"
end

if errors.any?
  warn errors.join("\n")
  exit 1
end

puts "Validated #{html_files.length} HTML pages and search.json."
