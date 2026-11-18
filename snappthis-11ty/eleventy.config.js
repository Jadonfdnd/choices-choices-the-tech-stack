export default function (eleventyConfig) {
	// Waar staan mijn bronbestanden en waar komt de gebouwde site
	eleventyConfig.setInputDirectory('src');
	eleventyConfig.setOutputDirectory('dist');

	// CSS en fonts worden niet door 11ty verwerkt, maar 1 op 1 gekopieerd naar dist
	eleventyConfig.addPassthroughCopy('src/css');
	eleventyConfig.addPassthroughCopy('src/fonts');
}