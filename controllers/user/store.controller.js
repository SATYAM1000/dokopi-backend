import { logger } from "../../config/logger.config.js";
import { XeroxStore } from "../../models/store.model.js";
import { StoreReview } from "../../models/review.model.js";
import mongoose from "mongoose";

//GET: `/api/v1/user/stores/nearest-stores?latitude=${latitude}&longitude=${longitude}&userZipCode=${userZipCode}&limit=${limit}&skip=${skip}`
export const fetchNearestStores = async (req, res) => {
  try {
    const { latitude, longitude, userZipCode } = req.query;

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
        msg: "latitude and longitude must be numbers",
        success: false,
      });
    }

    const nearestStoresResult = await XeroxStore.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLatitude, userLongitude],
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: {
          "storeDetails.storeLocation.storeZipCode": userZipCode,
          "storeStatus.isStoreVerified": true,
          "storeStatus.isStoreBlocked": false,
        },
      },
      {
        $sort: { distance: 1 },
      },
      {
        $facet: {
          paginatedStores: [
            { $skip: parseInt(req.query.skip) || 0 },
            { $limit: parseInt(req.query.limit) || 10 },
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
      {
        $unwind: "$paginatedStores",
      },
      {
        $project: {
          storeName: "$paginatedStores.storeDetails.storeName",
          storeLandmark:
            "$paginatedStores.storeDetails.storeLocation.storeLandmark",
          storeZipCode:
            "$paginatedStores.storeDetails.storeLocation.storeZipCode",
          storeCity: "$paginatedStores.storeDetails.storeLocation.storeCity",
          storeServices: "$paginatedStores.storeDetails.storeServices",
          distance: "$paginatedStores.distance",
          storeId: "$paginatedStores._id",
          storeImagesURL: "$paginatedStores.storeImagesURL",
          storeCurrentStatus: "$paginatedStores.storeCurrentStatus",
          storeLocationCoordinates: "$paginatedStores.storeLocationCoordinates",
        },
      },
    ]);

    const totalStores = await XeroxStore.countDocuments({
      "storeDetails.storeLocation.storeZipCode": userZipCode,
      "storeStatus.isStoreVerified": true,
      "storeStatus.isStoreBlocked": false,
    });

    if (nearestStoresResult.length === 0) {
      return res.status(404).json({
        msg: "Nearest stores not found!",
        success: false,
      });
    }

    const skipValue =
      typeof req.query.skip === "string" ? parseInt(req.query.skip, 10) : 0;

    return res.status(200).json({
      success: true,
      msg: "Nearest stores fetched successfully!",
      data: {
        stores: nearestStoresResult,
        totalCount: totalStores,
        pagination: {
          currentPage: Math.floor(req.query.skip / req.query.limit) + 1,
          hasMore: totalStores > nearestStoresResult.length + skipValue,
        },
      },
    });
  } catch (error) {
    logger.error(`Error while fetching nearest stores: ${error.message}`);
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
        "-createdAt -updatedAt -__v  -storeAdmins -storeCoupons -storeCreatedDate -storeProducts -storeOwner"
      )
      .populate({
        path: "storeReviews",
        populate: {
          path: "userId",
        },
        options: {
          sort: { createdAt: -1 },
          skip: (pageNumber - 1) * pageSize,
          limit: pageSize,
        },
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
    const { storeName, storeLandmark, city, services, storePhoneNumber } =
      req.query;

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
        "storeDetails.storePhoneNumber": storePhoneNumber,
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
      return res.status(404).json({
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

/**
 * NOTE: This API is not complete and requires additional implementation.
 *
 */
export const rateStore = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user._id;

    if (!storeId || !rating) {
      return res.status(400).json({
        msg: "Store id and rating are required!",
        success: false,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        msg: "Rating must be between 1 and 5!",
        success: false,
      });
    }

    const store = await XeroxStore.findById(storeId);
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    if (store.storeStatus.isStoreBlocked) {
      return res.status(400).json({
        msg: "Store is not available!",
        success: false,
      });
    }
    if (store.storeOwner.toString() === userId) {
      return res.status(400).json({
        msg: "You cannot rate your own store!",
        success: false,
      });
    }

    const existingReview = await StoreReview.findOne({
      store: storeId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        msg: "You have already rated this store!",
        success: false,
      });
    }

    //TODO: NEED TO CHANGE THIS LATER

    return res.status(200).json({
      msg: "Store rated successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while rating store: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
