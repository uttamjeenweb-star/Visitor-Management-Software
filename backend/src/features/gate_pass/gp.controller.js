var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
};
import * as gp_service_1 from "../gate_pass/gp.service.js";
import logger_utils_1 from "../../utils/logger.utils.js";
import { addClient, removeClient, notifyClients } from "./sse.js";

const broadcastDashboardUpdate = async () => {
  try {
    // Notify clients to refresh their specific scoped dashboard data instead of sending raw data
    notifyClients("refresh-dashboard", { action: "refresh" });
  } catch (error) {
    logger_utils_1.error(`Failed to broadcast dashboard update: ${error.message}`);
  }
};

const handleFormSubmission = async (req, res) => {
  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        status: "error",
        message: "Expected multipart/form-data. Check your frontend headers."
      });
    }
    // When upload.fields() is used, req.files is a dictionary, not a single file
    const files = req.files;
    const photoFiles = files?.["photo"];
    if (!photoFiles || photoFiles.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No photo uploaded."
      });
    }
    const photo = photoFiles[0];
    // Collect aadhar files in order: aadharFile_0, aadharFile_1, …
    const aadharFiles = [];
    let i = 0;
    while (files?.[`aadharFile_${i}`]) {
      aadharFiles.push(files[`aadharFile_${i}`][0]);
      i++;
    }
    logger_utils_1.debug(`Content-Type: ${contentType}`);
    logger_utils_1.debug(`Photo: ${photo.originalname} (${photo.size} bytes)`);
    logger_utils_1.debug(`Aadhar files received: ${aadharFiles.length}`);
    logger_utils_1.debug(`Body keys: ${Object.keys(req.body).join(", ")}`);
    const result = await (0, gp_service_1.processForm)(req.body, photo, aadharFiles);
    
    // Broadcast real-time update to dashboard
    broadcastDashboardUpdate();
    
    return res.status(201).json(result);
  } catch (error) {
    logger_utils_1.error(`Form submission failed: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};

const getPasses = async (req, res) => {
  try {
    const { startDate, endDate, status, ...otherFilters } = req.query || {};
    
    let filters = { ...otherFilters };

    if (status && status !== 'All') {
      filters.status = status;
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        filters.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const passes = await gp_service_1.getPassesService(filters, req.user);
    logger_utils_1.info(`Successfully fetched ${passes.length} passes`);
    return res.status(200).json({
      status: "success",
      data: passes
    });
  } catch (error) {
    logger_utils_1.error(`Failed to get passes: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};

const updatePassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updateData } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status is required."
      });
    }

    const pass = await gp_service_1.updatePassStatusService(id, status, updateData, req.user);
    
    // Broadcast real-time update to dashboard
    broadcastDashboardUpdate();

    return res.status(200).json({
      status: "success",
      data: pass
    });
  } catch (error) {
    logger_utils_1.error(`Failed to update pass status: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};

const getPassById = async (req, res) => {
  try {
    const { id } = req.params;
    const pass = await gp_service_1.getPassByIdService(id, req.user);
    if (!pass) {
      return res.status(404).json({
        status: "error",
        message: "Pass not found"
      });
    }
    return res.status(200).json({
      status: "success",
      data: pass
    });
  } catch (error) {
    logger_utils_1.error(`Failed to get pass: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const dashboardData = await gp_service_1.getDashboardDataService(req.user);
    return res.status(200).json({
      status: "success",
      data: dashboardData
    });
  } catch (error) {
    logger_utils_1.error(`Failed to get dashboard data: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};

const getDashboardStream = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ensure CORS is open for SSE
    
    // Immediately send current dashboard data based on their user scope
    const initialData = await gp_service_1.getDashboardDataService(req.user);
    res.write(`data: ${JSON.stringify({ event: "dashboard-update", data: initialData })}\n\n`);

    addClient(res);

    req.on('close', () => {
      removeClient(res);
    });
  } catch (error) {
    logger_utils_1.error(`SSE stream error: ${error.message}`);
    res.status(500).end();
  }
};

export { handleFormSubmission, getPasses, updatePassStatus, getPassById, getDashboardData, getDashboardStream };