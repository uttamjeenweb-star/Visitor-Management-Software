import { UPLOAD_DIR } from "../../config/uploads.js";
import fs_1 from "fs";
import path_1 from "path";
import logger_utils_1 from "../../utils/logger.utils.js";
import { prisma } from "../../config/db.js";
import { createNotification } from "../notifications/notification.service.js";
import { uploadImage } from "../../config/cloudinary.js";

const generateGatePassId = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.formData.findUnique({
      where: { gatePassId: code }
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

const processForm = async (data, file, aadharFiles) => {
  try {
    const uploadDir = UPLOAD_DIR;
    if (!fs_1.existsSync(uploadDir)) {
      fs_1.mkdirSync(uploadDir, {
        recursive: true
      });
    }
    let photoUrl = "";
    let photoPublicId = null;
    if (file) {
      const uploadResult = await uploadImage(file.buffer, 'create-pass/photos');
      photoUrl = uploadResult.secure_url;
      photoPublicId = uploadResult.public_id;
    }
    let carryWith = data.carryWith;
    let visitArea = data.visitArea;
    let persons = data.persons;
    try {
      carryWith = typeof carryWith === "string" ? JSON.parse(carryWith) : carryWith;
      if (!Array.isArray(carryWith)) carryWith = [];
    } catch {
      carryWith = [];
    }
    try {
      visitArea = typeof visitArea === "string" ? JSON.parse(visitArea) : visitArea;
      if (!Array.isArray(visitArea)) visitArea = [];
    } catch {
      visitArea = [];
    }
    try {
      persons = typeof persons === "string" ? JSON.parse(persons) : persons;
      if (!Array.isArray(persons)) persons = [];
    } catch {
      persons = [];
    }
    const personsWithFileUrls = await Promise.all(persons.map(async (person, index) => {
      const aadharFile = aadharFiles && aadharFiles[index];
      if (aadharFile) {
        const uploadResult = await uploadImage(aadharFile.buffer, 'create-pass/aadhar');
        return {
          ...person,
          aadharFileUrl: uploadResult.secure_url,
          aadharPublicId: uploadResult.public_id
        };
      }
      return {
        ...person,
        aadharFileUrl: "",
        aadharPublicId: null
      };
    }));
    const gatePassId = await generateGatePassId();
    const pass = await prisma.formData.create({
      data: {
        gatePassId,
        gatePassType: data.gatePassType || "single",
        passDate: new Date(data.passDate || Date.now()),
        from: data.from ? new Date(data.from) : null,
        to: data.to ? new Date(data.to) : null,
        mobileNo: data.mobileNo || "",
        name: data.name || "",
        emailId: data.emailId || "",
        companyName: data.companyName,
        address: data.address,
        state: data.state,
        city: data.city,
        representingVisitorType: data.representingVisitorType,
        subLocation: data.subLocation,
        toMeetWith: data.toMeetWith,
        carryWith: carryWith,
        idType: data.idType,
        idNumber: data.idNumber,
        description: data.description,
        maskCovid: data.maskCovid || "",
        noOfPerson: 1 + personsWithFileUrls.length,
        visitArea: visitArea,
        purpose: data.purpose,
        allowedHours: data.allowedHours,
        photoUrl: photoUrl,
        photoPublicId: photoPublicId,
        status: data.status || "Requested", // Defaulting to Requested to go to Requested Passes table
        persons: {
          create: personsWithFileUrls.map(p => ({
            name: p.name || "",
            phoneNo: p.phoneNo || "",
            aadharNumber: p.aadharNumber || "",
            aadharFileUrl: p.aadharFileUrl,
            aadharPublicId: p.aadharPublicId
          }))
        }
      },
      include: {
        persons: true
      }
    });

    // SMART ROUTING: Notify Department Manager
    if (data.toMeetWith) {
      const employee = await prisma.employee.findFirst({
        where: { 
          OR: [
            { id: data.toMeetWith },
            { name: data.toMeetWith } // Fallback for legacy string names
          ]
        },
        include: { departmentRef: true }
      });

      if (employee && employee.departmentRef && employee.departmentRef.managerEmployeeId) {
        const managerEmp = await prisma.employee.findUnique({
          where: { id: employee.departmentRef.managerEmployeeId }
        });
        if (managerEmp && managerEmp.email) {
          const managerUser = await prisma.user.findUnique({
            where: { email: managerEmp.email }
          });
          if (managerUser) {
            await createNotification(
              managerUser.id,
              "New Gate Pass Approval Request",
              `Visitor ${pass.name} is waiting for approval to meet ${employee.name}.`,
              "approval_request",
              `/dashboard/pass/${pass.id}`
            );
          }
        }
      }
    }

    logger_utils_1.info(`Gate pass created: ${pass.id}`);

    return {
      success: true,
      photoUrl: pass.photoUrl,
      data: pass
    };
  } catch (err) {
    logger_utils_1.error(`processForm error: ${err.message}`);
    throw new Error(err.message);
  }
};

const resolveDynamicStatus = (pass) => {
  if (!pass) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };
  const passDateStr = formatDate(pass.passDate);
  const expDateStr = pass.to ? formatDate(pass.to) : passDateStr;

  let isExpired = false;
  if (pass.gatePassType === 'single') {
    isExpired = todayStr > passDateStr;
  } else {
    isExpired = todayStr > expDateStr;
  }
  
  if (isExpired) return 'Expired';

  if (pass.status === 'Checked-In' || pass.status === 'Checked-Out') {
    return pass.status;
  }
  return pass.status;
};
import { getAllowedHostIds } from "../../utils/scope.js";

const getPassesService = async (filters = {}, user = null) => {
  try {
    let finalFilters = { ...filters };
    if (user) {
      const allowedHosts = await getAllowedHostIds(user);
      if (allowedHosts !== null) {
        if (allowedHosts.length === 0) {
          return []; // Scope restricts access entirely, return empty array immediately
        }
        finalFilters.toMeetWith = { in: allowedHosts };
      }
    }

    const passes = await prisma.formData.findMany({
      where: finalFilters,
      include: {
        persons: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return passes.map(p => ({
      ...p,
      status: resolveDynamicStatus(p)
    }));
  } catch (err) {
    logger_utils_1.error(`getPassesService error: ${err.message}`);
    throw new Error(err.message);
  }
};

const updatePassStatusService = async (idOrCode, status, updateData = {}, user = null) => {
  try {
    let finalFilters = {
      OR: [
        { id: idOrCode },
        { gatePassId: idOrCode }
      ]
    };

    if (user) {
      const allowedHosts = await getAllowedHostIds(user);
      if (allowedHosts !== null) {
        if (allowedHosts.length === 0) {
          throw new Error(`Permission denied: You do not have access to this pass.`);
        }
        finalFilters.toMeetWith = { in: allowedHosts };
      }
    }

    const pass = await prisma.formData.findFirst({
      where: finalFilters,
      include: {
        persons: true
      }
    });

    if (!pass) {
      throw new Error(`Gate pass not found with code/ID: ${idOrCode}`);
    }

    const dataToUpdate = { status };
    
    let actorString = "System";
    if (user) {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { roleRef: true, departmentRef: true }
      });
      if (fullUser) {
        const dept = fullUser.departmentRef?.name || "No Department";
        const role = fullUser.roleRef?.name || fullUser.role || "Unknown Role";
        actorString = `${fullUser.name} - ${dept} - ${role}`;
      }
    }

    if (status === "Pending") {
      dataToUpdate.rejectedBy = null;
      dataToUpdate.rejectedAt = null;
      dataToUpdate.rejectionReason = null;
    } else if (status === "Approved") {
      dataToUpdate.approvedBy = actorString;
      dataToUpdate.approvedAt = new Date();
    } else if (status === "Rejected") {
      dataToUpdate.rejectedBy = actorString;
      dataToUpdate.rejectedAt = new Date();
      dataToUpdate.rejectionReason = updateData.rejectionReason || "No reason specified";
    } else if (status === "Checked-In") {
      // Check if pass is expired based on dynamic status
      if (resolveDynamicStatus(pass) === "Expired") {
        throw new Error("Cannot check in. Pass has expired.");
      }
      if (pass.status === "Checked-In") {
        throw new Error("Cannot check in. Pass is already checked in.");
      }
      if (pass.status === "Checked-Out" && pass.gatePassType !== "multi") {
        throw new Error("Cannot check in. Single-day pass has already checked out.");
      }
      if (pass.status !== "Approved" && pass.status !== "Checked-Out") {
        throw new Error(`Cannot check in. Pass is not Approved (current status is: ${pass.status}).`);
      }

      const today = new Date().toISOString().split("T")[0];
      const passDateStr = pass.passDate.toISOString().split("T")[0];
      
      if (pass.gatePassType === "single") {
        if (today < passDateStr) {
          throw new Error(`Cannot check in today. Pass is valid for a future date: ${passDateStr}`);
        } else if (today > passDateStr) {
          throw new Error(`Cannot check in. Pass expired on: ${passDateStr}`);
        }
      } else {
        const fromDateStr = pass.from ? pass.from.toISOString().split("T")[0] : passDateStr;
        const toDateStr = pass.to ? pass.to.toISOString().split("T")[0] : passDateStr;
        
        if (today < fromDateStr) {
          throw new Error(`Cannot check in today. Pass is valid from: ${fromDateStr}`);
        } else if (today > toDateStr) {
          throw new Error(`Cannot check in. Pass expired on: ${toDateStr}`);
        }
      }

      dataToUpdate.checkedInBy = actorString;
      dataToUpdate.checkedInAt = new Date();
    } else if (status === "Checked-Out") {
      if (pass.status !== "Checked-In") {
        throw new Error(`Cannot check out. Pass is not Checked-In (current status is: ${pass.status}).`);
      }
      dataToUpdate.checkedOutBy = actorString;
      dataToUpdate.checkedOutAt = new Date();
    }

    // Don't blindly assign updateData over the secure actor fields
    delete updateData.approvedBy;
    delete updateData.rejectedBy;
    delete updateData.checkedInBy;
    delete updateData.checkedOutBy;
    Object.assign(dataToUpdate, updateData);

    const updatedPass = await prisma.formData.update({
      where: { id: pass.id },
      data: dataToUpdate,
      include: {
        persons: true
      }
    });
    logger_utils_1.info(`Gate pass ${pass.id} status updated to ${status}`);
    return updatedPass;
  } catch (err) {
    logger_utils_1.error(`updatePassStatusService error: ${err.message}`);
    throw new Error(err.message);
  }
};

const getPassByIdService = async (idOrCode, user = null) => {
  try {
    let baseWhere = {
      OR: [
        { id: idOrCode },
        { gatePassId: idOrCode }
      ]
    };

    if (user) {
      const allowedHosts = await getAllowedHostIds(user);
      if (allowedHosts !== null) {
        baseWhere.toMeetWith = { in: allowedHosts };
      }
    }

    const pass = await prisma.formData.findFirst({
      where: baseWhere,
      include: {
        persons: true
      }
    });
    if (pass) {
      pass.status = resolveDynamicStatus(pass);
    }
    return pass;
  } catch (err) {
    logger_utils_1.error(`getPassByIdService error: ${err.message}`);
    throw new Error(err.message);
  }
};

const getDashboardDataService = async (user = null) => {
  try {
    let finalFilters = {};
    if (user) {
      const allowedHosts = await getAllowedHostIds(user);
      if (allowedHosts !== null) {
        if (allowedHosts.length === 0) {
          // Empty scope, return zeroed data immediately
          return {
            totalPasses: 0,
            statusCounts: {},
            passesByPurpose: {},
            recentPasses: [],
            upcomingPasses: []
          };
        }
        finalFilters.toMeetWith = { in: allowedHosts };
      }
    }

    const passes = await prisma.formData.findMany({
      where: finalFilters,
      include: {
        persons: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const employees = await prisma.employee.findMany();
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.id] = emp.name;
    });

    const resolveEmployeeName = (toMeetWith) => {
      if (!toMeetWith) return '-';
      return employeeMap[toMeetWith] || toMeetWith;
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    };

    const formatDateTime = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleString();
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const mappedPasses = passes.map(p => {
      const passTypeLabel = p.gatePassType === 'single' ? 'Single' : 'Multi Day';
      const formattedPassDate = formatDate(p.passDate);
      const formattedExpDate = p.to ? formatDate(p.to) : formatDate(p.passDate);

      // Determine if expired dynamically
      let isExpired = false;
      if (p.gatePassType === 'single') {
        isExpired = todayStr > formattedPassDate;
      } else {
        isExpired = todayStr > formattedExpDate;
      }

      const resolvedStatus = isExpired ? 'Expired' : p.status;

      return {
        ...p,
        pass: passTypeLabel,
        id: p.id,
        gate_pass_id: p.gatePassId || '-',
        pass_date: formattedPassDate,
        date: formattedPassDate,
        timer: p.allowedHours ? `${p.allowedHours} hrs` : '-',
        name: p.name,
        employee: resolveEmployeeName(p.toMeetWith),
        mobile_no: p.mobileNo,
        'email-id': p.emailId,
        exp_date: formattedExpDate,
        status: resolvedStatus,
        approved_by: p.approvedBy || '-',
        approved_at: formatDateTime(p.approvedAt),
        rejected_by: p.rejectedBy || '-',
        rejected_at: formatDateTime(p.rejectedAt),
        rejection_reason: p.rejectionReason || '-',
        checked_in_by: p.checkedInBy || '-',
        checked_in_at: formatDateTime(p.checkedInAt),
        checked_out_by: p.checkedOutBy || '-',
        checked_out_at: formatDateTime(p.checkedOutAt),
        'checked-in': formatDateTime(p.checkedInAt),
        'checked-out': formatDateTime(p.checkedOutAt),
      };
    });

    // Let's count stats
    const totalCompaniesGuest = mappedPasses.length;
    
    // Count today's guests (passDate is today)
    const todaysGuest = mappedPasses.filter(p => p.pass_date === todayStr).length;

    // Filter by statuses exactly according to categories
    const requestPassData = mappedPasses.filter(p => p.status === 'Requested');
    const pendingApprovalPassData = mappedPasses.filter(p => p.status === 'Pending');
    const approvedPassData = mappedPasses.filter(p => p.status === 'Approved' || (p.status === 'Checked-Out' && p.gatePassType === 'multi'));
    const insidePassData = mappedPasses.filter(p => p.status === 'Checked-In');
    const multiDayPassData = mappedPasses.filter(p => p.gatePassType === 'multi' && p.status !== 'Expired');
    const exitApprovedPassData = mappedPasses.filter(p => p.status === 'Checked-Out');
    const expiredPassData = mappedPasses.filter(p => p.status === 'Expired');
    const rejectedPassData = mappedPasses.filter(p => p.status === 'Rejected');

    return {
      stats: {
        totalCompaniesGuest,
        todaysGuest
      },
      requestPassData,
      pendingApprovalPassData,
      approvedPassData,
      insidePassData,
      multiDayPassData,
      exitApprovedPassData,
      expiredPassData,
      rejectedPassData
    };
  } catch (err) {
    logger_utils_1.error(`getDashboardDataService error: ${err.message}`);
    throw new Error(err.message);
  }
};

export { processForm, getPassesService, updatePassStatusService, getPassByIdService, getDashboardDataService };