// load needed modules
const got = require("got");
const cheerio = require("cheerio");
const Property = require("../db/models/property");

// function to delete old data, and store new one
const syncData = (req, res) => {
  (async () => {
    try {
      // 1. delete any data in monodb
      await Property.deleteMany();

      // 2. fetch data from Ministry of Housing
      const rowMOHData = await got("https://ministry-of-housing-webapi.herokuapp.com/data").json();
      const mohData = rowMOHData.data.map(el => ({
        ...el,
        region: el.region.replace("محافظة", "").trim(),
        willayat: el.willayat.trim()
      }));

      // 3. fetch data from web scraping
      let scrapedData = [];
      const totalPages = Math.floor(26549 / 30);

      for (let i = 1; i <= totalPages; i++) {
        const rowScrapedData = await got(`https://om.opensooq.com/ar/عقارات-للبيع/all?per-page=30&page=${i}`);
        const $ = cheerio.load(rowScrapedData.body);

        $(".rectLiDetails").each((i, el) => {
          const region = $(el).children(".clear").text().replace(/\s/g, "").trim().split("|")[0];
          const willayat = $(el).children(".clear").text().replace(/\s/g, "").trim().split("|")[1];
          const price = $(el).children(".price-wrapper").text().replace(/\s/g, "").replace("ريال", "").replace(",", "").trim();
          const area = $(el).children(".clear").text().replace(/\D/g, "");
          let typeStr = $(el).children(".clear").text().replace(/\s/g, "");
          let type = "";
          if (typeStr.includes("سكنية")) type = "سكنية";
          if (typeStr.includes("تجارية")) type = "تجارية";
          if (typeStr.includes("صناعية")) type = "صناعية";
          if (typeStr.includes("أخرى")) type = "أخرى";
          if (typeStr.includes("غرف")) type = "سكنية";
          if (typeStr.includes("محل")) type = "تجارية";
          if (typeStr.includes("حمّام")) type = "سكنية";
          const year = 2021;
          scrapedData.push({
            region,
            willayat,
            village: "",
            zone: "",
            price,
            area,
            type,
            year,
            source: "EXTERNAL",
            contract: "sale"
          });
        });
      }
      // 4. merge ministry data with scraped data
      let data = [...mohData, ...scrapedData];

      // 5. insert fetched data in mongodb
      await Property.insertMany(data);

      res.json({
        status: "success",
        message: "All data synced successfully",
        data: true
      });
    } catch (error) {
      res.json({
        status: "error",
        message: "Failed to load data",
        data: error
      });
    }
  })();
}

// function to create new property
const createProperty = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  const property = new Property(body);

  if (!property) {
    return res.status(400).json({
      status: 'fail',
      message: 'Cannot create new property',
      data: null
    });
  }

  property
    .save()
    .then(() => {
      return res.status(201).json({
        status: 'success',
        message: 'New property created successfully',
        data: property
      });
    })
    .catch(error => {
      return res.status(400).json({
        status: 'error',
        message: 'Property not created',
        data: { errorCode: error }
      });
    });
}

// function to delete existing property
const deleteAllProperties = async (req, res) => {
  const data = await Property.remove();
  const count = data.deletedCount;

  return res.status(200).json({
    status: 'success',
    message: 'All data has been removed',
    data: count
  });
}

const reverseString = (str) => {
  var splitString = str.split("");
  var reverseArray = splitString.reverse();
  var joinArray = reverseArray.join("");
  return joinArray;
}

// export functions
module.exports = {
  createProperty,
  deleteAllProperties,
  syncData
}