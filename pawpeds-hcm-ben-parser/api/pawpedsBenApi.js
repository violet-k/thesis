import { scrape } from "../utils/browser.js";

const BASE_URL = "https://www.pawpeds.com/db/";

const getUrl = {
  total: () => `${BASE_URL}?a=ra&g=4&p=ben`,
  health: (id) => `${BASE_URL}?a=h&id=${id}&g=4&p=ben`,
  pedigree: (id) => `${BASE_URL}?a=p&id=${id}&g=4&p=ben`,
};

const getTotalNumber = async (page) => {
  return page.evaluate(async () => {
    const href = document.querySelector("tr > td > a")?.href;
    const urlParams = new URLSearchParams(href);
    return +urlParams.get("id");
  });
};

const getHealthInfo = async (page) => {
  return page.evaluate(async () => {
    let result = null;
    let hasHCMInfo = false;

    const rows = document.querySelectorAll("table tr");
    rows.forEach((row) => {
      const { innerText } = row;

      if (hasHCMInfo) {
        if (innerText.startsWith("Health Program:")) {
          hasHCMInfo = false;
          return;
        }
        if (innerText.startsWith("Result")) {
          result = innerText.replace("Result\t", "");
        }
      }

      if (innerText === "Health Program: Hypertrophic Cardiomyopathy") {
        hasHCMInfo = true;
      }
    });

    return result;
  });
};

const getCatInfo = async (page) => {
  return page.evaluate(async () => {
    // get parents info
    let sire = null;
    let dam = null;
    const parents = document.querySelectorAll(".siredamInPedigree");
    if (parents.length === 2) {
      const sireHref = new URLSearchParams(
        parents[0].parentElement.querySelector("a").href
      );
      sire = +sireHref.get("id");
      const damHref = new URLSearchParams(
        parents[1].parentElement.querySelector("a").href
      );
      dam = +damHref.get("id");
    }

    // get cat info
    let name = null;
    let sex = null;
    const title = document.querySelector("tr > th").innerText.split(",");

    title.forEach((part, index) => {
      part = part.trim();
      if (index === 0) {
        name = part;
      }

      if (part === "M" || part === "F") {
        sex = part;
      }
    });

    return { name, sex, sire, dam };
  });
};

export const PawpedsBenApi = {
  getHealth: async (id) =>
    scrape({
      url: getUrl.health(id),
      callback: getHealthInfo,
    }),
  getCatInfo: async (id) =>
    scrape({
      url: getUrl.pedigree(id),
      callback: getCatInfo,
    }),
  getTotalNumber: async () =>
    scrape({
      url: getUrl.total(),
      callback: getTotalNumber,
    }),
};
