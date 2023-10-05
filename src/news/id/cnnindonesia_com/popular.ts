import type { ScrapeArgument } from "../../../types";

export const scrape = async (scrape_argument: ScrapeArgument = {}) => {
  try {
    const response = await fetch(
      "https://www.cnnindonesia.com/api/v2/mostpop/2",
    );

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error; // Re-throw the error to handle it outside the function if needed
  }
};
