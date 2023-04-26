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

  let options:any = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("it-IT", options).format(new Date(date));
}
