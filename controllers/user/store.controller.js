import { logger } from "../../config/logger.config.js";
import { XeroxStore } from "../../models/store.model.js";
import { StoreReview } from "../../models/review.model.js";
import mongoose from "mongoose";
import { populate } from "dotenv";

export const fetchNearestStores = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      userZipCode,
      skip = 0,
      limit = 10,
    } = req.query;

    if (!userZipCode) {
      return res.status(400).json({
        msg: "Zip code is required!",
        success: false,
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        msg: "Latitude and longitude are required!",
        success: false,
      });
    }

    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    if (isNaN(userLatitude) || isNaN(userLongitude)) {
      return res.status(400).json({
        msg: "Latitude and longitude must be numbers",
        success: false,
      });
    }

    const nearestStoresResult = await XeroxStore.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLongitude, userLatitude], // Longitude first
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: {
          // "storeDetails.storeLocation.storeZipCode": userZipCode,
          "storeStatus.isStoreVerified": true,
          "storeStatus.isStoreBlocked": false,
        },
      },
      {
        $lookup: {
          from: "storehours", // Ensure this matches the actual collection name in MongoDB
          localField: "storeTiming",
          foreignField: "_id",
          as: "storeHours",
        },
      },
      {
        $unwind: {
          path: "$storeHours",
          preserveNullAndEmptyArrays: true, // In case some stores do not have store hours set
        },
      },
      {
        $sort: { distance: 1 },
      },
      {
        $facet: {
          paginatedStores: [
            { $skip: parseInt(skip, 10) },
            { $limit: parseInt(limit, 10) },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          paginatedStores: 1,
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
        },
      },
    ]);

    const totalStores = nearestStoresResult[0].totalCount || 0;
    const stores = nearestStoresResult[0].paginatedStores;

    if (stores.length === 0) {
      return res.status(404).json({
        msg: "Nearest stores not found!",
        success: false,
      });
    }

    const currentPage = Math.floor(skip / limit) + 1;
    const hasMore = totalStores > skip + stores.length;

    return res.status(200).json({
      success: true,
      msg: "Nearest stores fetched successfully!",
      data: {
        stores: stores.map((store) => ({
          storeName: store.storeDetails.storeName,
          storeLandmark: store.storeDetails.storeLocation.storeLandmark,
          storeZipCode: store.storeDetails.storeLocation.storeZipCode,
          storeCity: store.storeDetails.storeLocation.storeCity,
          storeServices: store.storeDetails.storeServices,
          distance: store.distance,
          storeId: store._id,
          storeImagesURL: store.storeImagesURL,
          storeCurrentStatus: store.storeCurrentStatus,
          storeLocationCoordinates: store.storeLocationCoordinates,
          storeHours: store.storeHours, // Include store hours
          storeImagesKeys: store.storeImagesKeys,
        })),
        totalCount: totalStores,
        pagination: {
          currentPage,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error(`Error while fetching nearest stores: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

//GET: `/api/v1/user/stores/get-store-info/:storeId`
export const fetchSingleStoreDetailsById = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const pageNumber = req.query.pageNumber
      ? parseInt(req.query.pageNumber)
      : 1;

    const pageSize = 4;

    const store = await XeroxStore.findById(storeId)
      .select(
        "-createdAt -updatedAt -__v  -storeAdmins -storeCoupons -storeCreatedDate -storeProducts -storeOwner -storeSetUpProgress -storeImagesURL -isStoreSetupComplete -storeWalletBalance"
      )
      .populate({
        path: "storeReviews",
        populate: {
          path: "userId",
        },
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate({
        path: "storeTiming", // Populating the storeTiming field with StoreHours data
        select: "-createdAt -updatedAt -__v",
      })
      .populate({
        path: "pricing",
        select: "-createdAt -updatedAt -__v -storeId -_id",
      });

    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    if (store.storeStatus.isStoreBlocked) {
      return res.status(400).json({
        msg: "Store is blocked!",
        success: false,
      });
    }

    if (!store.storeStatus.isStoreVerified) {
      return res.status(400).json({
        msg: "Store is not verified!",
        success: false,
      });
    }

    const totalReviewsCount = await StoreReview.countDocuments({
      storeId: storeId,
    });
    const hasMoreReviews = totalReviewsCount > pageNumber * pageSize;

    return res.status(200).json({
      success: true,
      msg: "Store details fetched successfully!",
      data: store,
      pagination: {
        hasMoreReviews: hasMoreReviews,
        totalReviewsCount: totalReviewsCount,
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    logger.error(`Error while fetching single store details: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

//GET /api/v1/user/stores/search?storeName=Xerox&city=New%20York&services=Printing,Scanning
export const searchStores = async (req, res) => {
  try {
    const {
      Name: storeName,
      Location: storeLandmark,
      city,
      services,
      Phone: storePhoneNumber,
    } = req.query;

    if (!Object.keys(req.query).length) {
      return res.status(400).json({
        msg: "At least one search parameter is required!",
        success: false,
      });
    }

    const query = {};
    const searchCriteria = [];

    if (storeName) {
      searchCriteria.push({
        "storeDetails.storeName": { $regex: new RegExp(storeName, "i") },
      });
    }

    if (storeLandmark) {
      searchCriteria.push({
        "storeDetails.storeLocation.storeLandmark": {
          $regex: new RegExp(storeLandmark, "i"),
        },
      });
    }

    if (city) {
      searchCriteria.push({
        "storeDetails.storeLocation.storeCity": {
          $regex: new RegExp(city, "i"),
        },
      });
    }

    if (services) {
      const serviceRegex = new RegExp(`^${services}$`, "i"); // Match exact string with case-insensitive
      const serviceQuery = {
        $or: [
          { "storeDetails.storeServices": { $in: services.split(",") } }, // Match services in the provided list
          { "storeDetails.storeServices": serviceRegex }, // Match services with case-insensitive regex
        ],
      };
      searchCriteria.push(serviceQuery);
    }

    if (storePhoneNumber) {
      searchCriteria.push({
        "storeDetails.storePhoneNumber": {
          $regex: new RegExp(`^${storePhoneNumber}`, "i"),
        },
      });
    }

    query.$and = searchCriteria;

    const options = { limit: 100 };
    if (req.query.limit && parseInt(req.query.limit) > 0) {
      options.limit = parseInt(req.query.limit);
    }

    const skip = req.query.skip ? parseInt(req.query.skip) : 0;

    const stores = await XeroxStore.find(query, {
      _id: 1,
      "storeDetails.storeName": 1,
      "storeDetails.storeLocation": 1,
    })
      .skip(skip)
      .limit(options.limit);

    if (!stores.length) {
      return res.status(200).json({
        msg: "Stores not found!",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Stores fetched successfully!",
      data: stores,
    });
  } catch (error) {
    logger.error(`Error while searching stores: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
