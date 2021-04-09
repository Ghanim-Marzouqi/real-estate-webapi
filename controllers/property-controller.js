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
          if (typeStr.includes("سكنية")) type = "سكني";
          if (typeStr.includes("تجارية")) type = "تجاري";
          if (typeStr.includes("صناعية")) type = "صناعي";
          if (typeStr.includes("أخرى")) type = "أخرى";
          if (typeStr.includes("غرف")) type = "سكني";
          if (typeStr.includes("محل")) type = "تجاري";
          if (typeStr.includes("حمّام")) type = "سكني";
          const year = Math.floor(Math.random() * (2021 - 2015 + 1) + 2015);
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

      return res.json({
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

// function to load all data
const loadAllProperties = async (req, res) => {
  const body = req.body;
  const params = req.query;

  let options = {
    page: req.query.page || 1,
    limit: req.query.limit || 30
  };

  let searchParams = {};

  if (Object.keys(body).length > 0) {
    if (body.year && body.year !== "") {
      searchParams = { ...searchParams, year: body.year };
    }

    if (body.region && body.region !== "") {
      searchParams = { ...searchParams, region: body.region };
    }

    if (body.willayat && body.willayat !== "") {
      searchParams = { ...searchParams, willayat: body.willayat };
    }

    if (body.village && body.village !== "") {
      searchParams = { ...searchParams, village: body.village };
    }

    if (body.zone && body.zone !== "") {
      searchParams = { ...searchParams, zone: body.zone };
    }

    if (body.moh) {
      searchParams = { ...searchParams, source: "MOH" };
    }

    if (body.external) {
      searchParams = { ...searchParams, source: "EXTERNAL" };
    }

    if (body.sale) {
      searchParams = { ...searchParams, contract: "sale" };
    }

    if (body.mortgage) {
      searchParams = { ...searchParams, contract: "mortgage" };
    }

    if (body.swap) {
      searchParams = { ...searchParams, contract: "swap" };
    }

    if (body.residential) {
      searchParams = { ...searchParams, type: "سكني" };
    }

    if (body.commercial) {
      searchParams = { ...searchParams, type: "تجاري" };
    }

    if (body.industrial) {
      searchParams = { ...searchParams, type: "صناعي" };
    }

    if (body.governmental) {
      searchParams = { ...searchParams, type: "حكومي" };
    }

    if (body.tourist) {
      searchParams = { ...searchParams, type: "سياحي" };
    }

    if (body.agricultral) {
      searchParams = { ...searchParams, type: "زراعي" };
    }

    if (body.residential_commercial) {
      searchParams = { ...searchParams, type: "سكني/تجاري" };
    }

    if (body.others) {
      searchParams = { ...searchParams, type: "أخرى" };
    }

    Property.paginate(searchParams, options, (err, result) => {
      if (err) {
        return res.status(200).json({
          status: 'error',
          message: 'Error has occured while loading properties',
          data: err
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Properties loaded successfully',
        data: result
      });
    });

  } else {
    Property.paginate({}, options, (err, result) => {
      if (err) {
        return res.status(200).json({
          status: 'error',
          message: 'Error has occured while loading properties',
          data: err
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Properties loaded successfully',
        data: result
      });
    });
  }
}

// export functions
module.exports = {
  createProperty,
  deleteAllProperties,
  syncData,
  loadAllProperties
}