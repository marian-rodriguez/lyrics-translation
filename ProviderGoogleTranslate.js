const ProviderGoogleTranslate = (() => {
	// You'll need to get a Google Cloud API key for this to work
	// https://console.cloud.google.com/apis/credentials
	const API_KEY = ""; // Add your Google Cloud API key here
	const BASE_URL = "https://translation.googleapis.com/language/translate/v2";
	const TARGET_LANGUAGE = "es"; // Always translate to Spanish

	async function translateText(text) {
		if (!API_KEY) {
			console.warn("Google Translate API key not configured");
			return null;
		}

		try {
			const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					q: text,
					target: TARGET_LANGUAGE,
					format: "text"
				})
			});

			const data = await response.json();
			return data.data?.translations?.[0]?.translatedText || null;
		} catch (error) {
			console.error("Google Translate API error:", error);
			return null;
		}
	}

	async function translateLyrics(lyrics) {
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

			const translatedText = await translateText(originalText);
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
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		return translatedLyrics;
	}

	return {
		translateLyrics,
		translateText
	};
})(); 