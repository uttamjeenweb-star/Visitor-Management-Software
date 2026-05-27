import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const masterData = {
  visitingArea: [
    { name: "Lobby", description: "Main Entrance Lobby", floor: "Ground Floor" },
    { name: "Conference Room A", description: "First Floor Meeting Area", floor: "1st Floor" },
    { name: "Server Room", description: "IT Infrastructure Room", floor: "Basement" },
    { name: "Cafeteria", description: "Employee Dining Area", floor: "Ground Floor" },
    { name: "Executive Floor", description: "Top Floor Offices", floor: "Top Floor" },
  ],
  visitorType: [
    { name: "Contractor", description: "External Contractors and Workers" },
    { name: "Guest", description: "Personal or Corporate Guests" },
    { name: "Interviewee", description: "Job Applicants" },
    { name: "Vendor", description: "Suppliers and Vendors" },
    { name: "Delivery", description: "Courier and Delivery Personnel" },
  ],
  purpose: [
    { name: "Meeting", description: "Business Meeting" },
    { name: "Interview", description: "Job Interview" },
    { name: "Maintenance", description: "Repair and Maintenance" },
    { name: "Delivery", description: "Dropping off packages" },
    { name: "Personal Visit", description: "Visiting an employee" },
  ],
  idType: [
    { name: "National ID", description: "Standard Government Issued ID" },
    { name: "Driving License", description: "Driver's License" },
    { name: "Passport", description: "International Passport" },
    { name: "Company ID", description: "Corporate ID Card" },
    { name: "Voter ID", description: "Voter Registration Card" },
  ],
  carryWith: [
    { name: "Laptop", description: "Personal or Corporate Laptop" },
    { name: "Toolbox", description: "Tools for Maintenance" },
    { name: "Mobile Phone", description: "Smartphone" },
    { name: "Briefcase", description: "Documents and Files" },
    { name: "None", description: "No items carried" },
  ]
};

const seedMasterDataAdd = async () => {
  try {
    console.log("Adding new Master Data (Preserving existing)...");

    for (const item of masterData.visitingArea) {
      await prisma.visitingArea.create({ data: { ...item, status: "active" } });
    }
    console.log(`Added ${masterData.visitingArea.length} Visiting Areas.`);

    for (const item of masterData.visitorType) {
      await prisma.visitorType.create({ data: { ...item, status: "active" } });
    }
    console.log(`Added ${masterData.visitorType.length} Visitor Types.`);

    for (const item of masterData.purpose) {
      await prisma.purpose.create({ data: { ...item, status: "active" } });
    }
    console.log(`Added ${masterData.purpose.length} Purposes.`);

    for (const item of masterData.idType) {
      await prisma.idType.create({ data: { ...item, status: "active" } });
    }
    console.log(`Added ${masterData.idType.length} ID Types.`);

    for (const item of masterData.carryWith) {
      await prisma.carryWith.create({ data: { ...item, status: "active" } });
    }
    console.log(`Added ${masterData.carryWith.length} Carry With items.`);

    console.log("Successfully added all master data!");
  } catch (error) {
    console.error("Error adding master data:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
};

seedMasterDataAdd();
