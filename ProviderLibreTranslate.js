const ProviderLibreTranslate = (() => {
	// Free translation service - no API key required
	const BASE_URL = "https://libretranslate.de/translate";
	
	// Alternative free services if one doesn't work
	const ALTERNATIVE_URLS = [
		"https://translate.argosopentech.com/translate",
		"https://libretranslate.com/translate"
	];

	async function translateText(text, targetLanguage = "en", sourceLanguage = "auto") {
		if (!text || text.trim() === "") {
			return null;
		}

		const payload = {
			q: text,
			source: sourceLanguage,
			target: targetLanguage,
			format: "text"
		};

		// Try the main service first
		try {
			const response = await fetch(BASE_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const data = await response.json();
				return data.translatedText || null;
			}
		} catch (error) {
			console.warn("LibreTranslate main service failed, trying alternatives...");
		}

		// Try alternative services
		for (const url of ALTERNATIVE_URLS) {
			try {
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload)
				});

				if (response.ok) {
					const data = await response.json();
					return data.translatedText || null;
				}
			} catch (error) {
				console.warn(`LibreTranslate alternative service ${url} failed`);
			}
		}

		console.error("All LibreTranslate services failed");
		return null;
	}

	async function translateLyrics(lyrics, targetLanguage = "en", sourceLanguage = "auto") {
		if (!Array.isArray(lyrics) || !lyrics.length) {
			return null;
		}

		const translatedLyrics = [];
		
		for (const line of lyrics) {
			const originalText = line.text || line.originalText || "";
			if (!originalText || originalText.trim() === "") {
				translatedLyrics.push(line);
				continue;
			}

			const translatedText = await translateText(originalText, targetLanguage, sourceLanguage);
			if (translatedText) {
				translatedLyrics.push({
					...line,
					text: translatedText,
					originalText: originalText
				});
			} else {
				translatedLyrics.push(line);
			}

			// Add a small delay to avoid rate limiting
			await new Promise(resolve => setTimeout(resolve, 200));
		}

		return translatedLyrics;
	}

	// Get supported languages
	async function getSupportedLanguages() {
		try {
			const response = await fetch("https://libretranslate.de/languages");
			if (response.ok) {
				const languages = await response.json();
				return languages.reduce((acc, lang) => {
					acc[lang.code] = lang.name;
					return acc;
				}, {});
			}
		} catch (error) {
			console.warn("Could not fetch supported languages");
		}

		// Fallback to common languages
		return {
			"en": "English",
			"es": "Spanish", 
			"fr": "French",
			"de": "German",
			"it": "Italian",
			"pt": "Portuguese",
			"ru": "Russian",
			"ja": "Japanese",
			"ko": "Korean",
			"zh": "Chinese",
			"ar": "Arabic",
			"hi": "Hindi"
		};
	}

	return {
		translateLyrics,
		translateText,
		getSupportedLanguages
	};
})(); 