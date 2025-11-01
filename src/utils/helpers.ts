// define typescript zip fuction like the one from lodash
// usage example
// const metadataList = ["Yellow Bus", "Baklan", "2020", "Yellow Bus"];
// const metadataProps = ["titolo", "artista", "anno", "album"];
// const metadata = zip(metadataProps, metadataList);
// console.log(metadata);
// output
// { titolo: 'Yellow Bus', artista: 'Baklan', anno: '2020', album: 'Yellow Bus' }


export function zip(props: string[], values: string[]) {
  return values.reduce((acc, curr: string, i) => {
    (acc as any)[props[i]] = curr;
    return acc;
  }, {});
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);


// convert a string date to a string international date
// example: 2021-01-01 to 1 January 2021
export const getFriendlyDate = (date: string) => {
  const d = new Date(date);

  let options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("it-IT", options).format(new Date(date));
}


export const getCover = (attributes: any, imageUrlBase: string) => {
  if (!attributes?.cover?.data?.attributes?.url) return "";
  const coverData = attributes?.cover?.data?.attributes;
  const format = coverData.width > 500 ? "small_" : "";
  const urlPath = coverData.url?.substring(0, coverData.url?.lastIndexOf("/"));
  const cover = `${imageUrlBase}${urlPath}/${format}${coverData.hash}${coverData.ext}`;
  return cover;
}

/**
 * Converts text from common radio stream encodings to UTF-8
 * Radio streams often use ISO-8859-1 (Latin-1) or Windows-1252 encoding
 * but the app displays them as UTF-8, causing misencoded characters
 */
export const fixEncoding = (text: string): string => {
  if (!text || typeof text !== 'string') return text;

  try {
    // First try to detect if it's already valid UTF-8
    // If decodeURIComponent succeeds, it's likely already UTF-8
    decodeURIComponent(text);
    return text;
  } catch {
    // If decodeURIComponent fails, it might be encoded in another format
    // Try to convert from ISO-8859-1 (Latin-1) to UTF-8
    try {
      // Convert ISO-8859-1 bytes to UTF-8
      const bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i);
      }

      // Use TextDecoder if available (modern browsers/React Native)
      if (typeof TextDecoder !== 'undefined') {
        const decoder = new TextDecoder('iso-8859-1');
        return decoder.decode(bytes);
      } else {
        // Fallback: manual conversion for common characters
        return text
          .replace(/Ã©/g, 'é')  // é
          .replace(/Ã¨/g, 'è')  // è
          .replace(/Ã¬/g, 'ì')  // ì
          .replace(/Ã²/g, 'ò')  // ò
          .replace(/Ã¹/g, 'ù')  // ù
          .replace(/Ã /g, 'à')  // à
          .replace(/Ã¬/g, 'Ì')  // Ì
          .replace(/Ã²/g, 'Ò')  // Ò
          .replace(/Ã¹/g, 'Ù')  // Ù
          .replace(/Ã€/g, 'À')  // À
          .replace(/Ãˆ/g, 'È')  // È
          .replace(/Ã/g, 'Í')  // Í
          .replace(/Ã“/g, 'Ó')  // Ó
          .replace(/Ãš/g, 'Ú')  // Ú
          .replace(/Ã‘/g, 'Ñ')  // Ñ
          .replace(/Ã±/g, 'ñ')  // ñ
          .replace(/Â°/g, '°')  // °
          .replace(/â‚¬/g, '€')  // €
          .replace(/â€"/g, '"') // "
          .replace(/â€"/g, '"') // "
          .replace(/â€˜/g, "'") // '
          .replace(/â€™/g, "'") // '
          .replace(/â€"/g, '–') // –
          .replace(/â€"/g, '—'); // —
      }
    } catch (error) {
      console.warn('Encoding conversion failed:', error);
      return text; // Return original text if conversion fails
    }
  }
};
