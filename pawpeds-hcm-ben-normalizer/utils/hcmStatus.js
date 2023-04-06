import { scrape } from "./browser.js";
const BASE_URL = "https://www.pawpeds.com/db/";

const statusActions = {
  clarify: [
    "result registered but not public yet",
    "other diagnosis",
    "other",
    "no diagnosis",
    "no assessment",
    "equivocal",
  ],
  remove: ["rcm"],
};

const normalizeStatus = (status = "") => {
  if (
    new RegExp(["hcm", "severe", "moderate", "mild"].join("|")).test(status)
  ) {
    return "HCM";
  }

  return status;
};

const getHealthResults = async (page) => {
  return page.evaluate(async () => {
    let result = [];
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
          result.push(innerText.replace("Result\t", ""));
        }
      }

      if (innerText === "Health Program: Hypertrophic Cardiomyopathy") {
        hasHCMInfo = true;
      }
    });

    return result;
  });
};

const clarifyStatus = async (id) => {
  return scrape({
    url: `${BASE_URL}?a=h&id=${id}&g=4&p=ben`,
    callback: getHealthResults,
  });
};

const getValidStatus = async ({ id, hcm }) => {
  if (statusActions.remove.includes(hcm)) {
    return;
  }

  if (statusActions.clarify.includes(hcm)) {
    let results = await clarifyStatus(id);

    results = results.map((status) => status.toLowerCase());

    if (results.length !== 1) {
      for (let i = results.length - 2; i >= 0; i--) {
        if (statusActions.remove.includes(results[i])) {
          return;
        }

        if (statusActions.clarify.includes(results[i])) {
          continue;
        }

        hcm = results[i];
        break;
      }
    }

    if (statusActions.clarify.includes(hcm)) {
      return;
    }
  }

  return normalizeStatus(hcm);
};

export { getValidStatus };
