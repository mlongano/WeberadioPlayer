import qs from "qs";
import Config from "react-native-config";
import { checkEnvVars, checkStatus } from "../utils/errorHandling";

const headers = {
  "Authorization": `Bearer ${Config.STRAPI_API_TOKEN}`,
  "Content-Type": "application/json"
}

export const queryPodcasts = {
  fields: ["title", "slug", "date", "description", "spreaker_id", "spreaker_limited"],
  populate: {
    tags: {
      fields: ["name"]
    },
    cover: {
      fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
    },
    audio: {
      fields: ["caption", "url"],
    },
    schools: {
      fields: ["name", "short_name", "slug", "description"],
      populate: {
        logo: {
          fields: ["url", "caption"],
        },
      },
    },
    episodes: {
      fields: ["title", "slug", "date", "description", "spreaker_id", "spreaker_limited"],
      populate: {
        audio: {
          fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
        },
        cover: {
          fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
        },
      }
    },
  }
};

export const queryEpisodes = {
  fields: ["title", "slug", "subtitle", "date", "description", "episode_number", "spreaker_id", "spreaker_limited"],
  populate: {
    tags: {
      fields: ["name"]
    },
    cover: {
      fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
    },
    audio: {
      fields: ["caption", "url"],
    },
    schools: {
      fields: ["name", "short_name", "slug"]
    },
    podcast: {
      fields: ["title", "slug", "date", "description", "tags", "cover"],
      populate: {
        schools: {
          fields: ["name", "short_name", "slug"]
        },
        cover: {
          fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
        },
      }
    },
  }
};

export const querySchools = {
  fields: ["name", "short_name", "slug", "description"],
  populate: {
    logo: {
      fields: ["url", "caption"],
    },
    podcasts: {
      fields: ["title", "slug", "description", "tags", "cover"],
      populate: {
        cover: {
          fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
        },
      }
    },
    episodes: {
      fields: ["title", "slug", "subtitle", "date", "description", "episode_number", "spreaker_id", "spreaker_limited"],
      populate: {
        cover: {
          fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
        },
        audio: {
          fields: ["caption", "url"],
        },
        podcast: {
          fields: ["title", "slug", "description", "tags", "cover"],
          populate: {
            cover: {
              fields: ["url", "caption", "hash", "ext", "width", "height", "size"],
            },
          }
        },
      }
    },
  }
};

export const queryTags = {
  fields: ["name"]
};

export const queryPosts = {
  fields: ["title", "slug", "subtitle", "date", "article"],
  populate: {
    tags: {
      fields: ["name"]
    },
    image: {
      fields: ["caption", "hash", "ext", "url", "width", "height", "size"],
    }
  }
};

// Generic fetch function for Strapi
export const strapiFetch = async (endpoint: string, query: any, allPages = false, pageSize: number | null = null) => {

  const localFetch = async (queryPages: any) => {
    checkEnvVars();
    const response = await fetch(`${Config.STRAPI_URL_BASE}${endpoint}?${qs.stringify(queryPages)}`, {
      method: "GET",
      headers: headers
    });
    checkStatus(response);
    const data = await response.json();

    if (data.error) {
      throw new Response("Error getting data from Strapi", { status: 500 })
    }
    if (data?.data?.length === 0) {
      throw new Response(`No data for endpoint ${endpoint} with query "${JSON.stringify(query)}" found`, { status: 404 });
    }

    return data;
  }

  const ps = query["pagination[pageSize]"] || pageSize || Config.DEFAULT_PAGE_SIZE || 50;

  let queryPages: any = {
    "pagination[page]": query["pagination[page]"] || 1,
    "pagination[pageSize]": ps,
    ...query
  };

  const fetchedData = await localFetch(queryPages);


  if (allPages && fetchedData?.pagination?.page < fetchedData?.pagination?.pages) {
    // get all the episodes from Strapi API in parallel using Promise.all and the number of pages of episodes to get from Strapi API to get from Strapi API
    const pageCount = fetchedData?.meta.pagination?.pageCount;

    // Get the other pages of data in parallel if there are any
    const promises = [];
    for (let i = 2; i <= pageCount; i++) {
      queryPages["pagination[page]"] = i;
      const response = localFetch(queryPages);
      promises.push(response);
    }
    // wait for all the promises to resolve and check the status of each response
    if (promises.length > 0) {
      const responses = await Promise.all(promises);
      responses.forEach(response => checkStatus(response));
      const dataAll = await Promise.all(responses);
      fetchedData.data = fetchedData.data.concat(...dataAll.map(data => data.data));
    }
  }
  return fetchedData;
};

// fetch Hero Image from Strapi
export const heroImageFetch = async (heroImageId: string) => {
  const queryHeroImage: any = {
    populate: {}
  };
  queryHeroImage.populate[heroImageId] = {
    fields: ["url"]
  };

  const result = await strapiFetch("/api/hero-image", queryHeroImage);
  let heroImage = result?.data?.attributes[heroImageId]?.data?.attributes?.url;
  return heroImage;
}

// schoolsFetchAllSlugs fetches all schools slugs
export const schoolsFetchAllBasic = async () => {
  const query: any = {
    sort: "sort_order:asc",
    fields: ["name", "slug", "short_name", "description", "sort_order"],
    populate: {
      logo: {
        fields: ["url", "caption"],
      },
    }
  };

  const schools = await strapiFetch("/api/schools", query, true);
  return schools?.data;
};


// Fetch all pages of podcasts fitered by query
export const podcastsFetchAll = async (query: any) => {

  const podcasts = await strapiFetch("/api/podcasts", query, true);
  return podcasts?.data;
};

// Fetch all pages of episodes fitered by query
export const episodesFetchAll = async (query: any) => {

  const episodes = await strapiFetch("/api/episodes", query, true);
  return episodes?.data;
};

// Fetch all posts fitered by query
export const postsFetchAll = async (query: any) => {

  const posts = await strapiFetch("/api/posts", query, true);
  return posts?.data;
};

// Fetch a single podcast by slug
export const podcastFetchFirst = async (slug: string) => {
  const query: any = {
    filters: {
      slug: {
        $eq: slug
      }
    },
    ...queryPodcasts
  };

  const podcasts = await strapiFetch("/api/podcasts", query, false, 1);
  return podcasts.data[0].attributes;
};

// Fetch a single episode by slug
export const episodeFetchFirst = async (slug: string) => {
  const query: any = {
    filters: {
      slug: {
        $eq: slug
      }
    },
    ...queryEpisodes
  };

  const episodes = await strapiFetch("/api/episodes", query, false, 1);
  return episodes.data[0].attributes;
};

// Fetch a single post by slug
export const postFetchFirst = async (slug: string) => {
  checkEnvVars();
  const query: any = {
    filters: {
      slug: {
        $eq: slug
      }
    },
    ...queryPosts
  };

  const posts = await strapiFetch("/api/posts", query, false, 1);
  return posts.data[0].attributes;
}