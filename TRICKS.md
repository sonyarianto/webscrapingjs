```js
    let authors = await page.evaluate(() => {
        const scriptTags = document.querySelectorAll(
        'script[type="text/javascript"]',
        );
        for (const script of scriptTags) {
            try {
                const scriptContent = script.textContent as string;
                if (scriptContent.includes("window.kmklabs.gtm")) {
                const startIndex =
                    scriptContent.indexOf("window.kmklabs.gtm") +
                    "window.kmklabs.gtm = ".length;
                const endIndex = scriptContent.indexOf(";", startIndex);
                const jsonContent = scriptContent.substring(
                    startIndex,
                    endIndex,
                );
                const data = JSON.parse(jsonContent);
                return data.authors.names;
                }
            } catch (error) {
                // Handle JSON parsing errors, if any
            }
        }
        return null; // Return null if not found
    });
```