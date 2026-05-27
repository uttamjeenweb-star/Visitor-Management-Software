import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const resetDatabase = async () => {
  try {
    console.log("Starting full database reset...");

    // Disable foreign key checks
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = (SELECT DATABASE());
    `;

    // Truncate all tables
    for (const table of tables) {
      if (table.TABLE_NAME !== '_prisma_migrations') {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table.TABLE_NAME}\`;`);
        console.log(`Truncated table: ${table.TABLE_NAME}`);
      }
    }

    // Enable foreign key checks
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
    console.log("All data cleared successfully.");

    console.log("Seeding Super Admin...");

    // Modules exactly matching the categories
    const masterDataModules = ["Employee", "Department", "VisitorType", "VisitingArea", "Purpose", "CarryWith", "IdType", "Location"];
    const systemSettingsModules = ["Role", "CompanyRegister"];
    const dashboardModules = ["Dashboard"];
    const reportModules = ["Report", "Print"];

    const permissionsData = [
      ...masterDataModules.map(module => ({
        module, canRead: true, canCreate: true, canUpdate: true, canDelete: true, dashboardActions: {},
      })),
      ...systemSettingsModules.map(module => ({
        module, canRead: true, canCreate: true, canUpdate: true, canDelete: true, dashboardActions: {},
      })),
      ...dashboardModules.map(module => ({
        module, canRead: false, canCreate: false, canUpdate: false, canDelete: false,
        dashboardActions: {
          check_in: true, check_out: true, print: true, view_detail: true, create_pass: true, approve: true, reject: true,
          view_requested_list: true, view_pending_approval_list: true, view_rejected_list: true, view_approved_list: true,
          view_inside_list: true, view_multi_day_list: true, view_exited_list: true, view_expired_list: true,
        },
      })),
      ...reportModules.map(module => ({
        module, canRead: false, canCreate: false, canUpdate: false, canDelete: false,
        dashboardActions: module === 'Report' ? { view: true, export: true } : { print_setting: true, print: true },
      }))
    ];

    const role = await prisma.role.create({
      data: {
        name: "Super Admin",
        weight: 100,
        dataScope: "global",
        permissions: {
          create: permissionsData,
        },
      },
    });
    console.log("Super Admin Role created.");

    // 1. Create Department
    const department = await prisma.department.create({
      data: {
        name: "HEADQUARTERS",
        status: "active"
      }
    });
    console.log("Department created: HEADQUARTERS");

    // 2. Create Location
    const location = await prisma.location.create({
      data: {
        name: "Main HQ",
        description: "Primary Headquarters",
        status: "active"
      }
    });
    console.log("Location created: Main HQ");

    const adminEmail = "superadmin@gmail.com";
    const plainPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    // 3. Generate Employee ID
    const deptPrefix = department.name.substring(0, 3).toUpperCase();
    const employeeId = `${deptPrefix}001`;

    // 4. Create Employee
    const employee = await prisma.employee.create({
      data: {
        name: "Super Administrator",
        employeeId: employeeId,
        department: department.name,
        departmentId: department.id,
        designation: "System Administrator",
        email: adminEmail,
        status: "active",
        roleId: role.id,
        assignedLocationId: location.id
      }
    });
    console.log(`Employee created with ID: ${employeeId}`);

    // 5. Create User
    await prisma.user.create({
      data: {
        name: employee.name,
        email: adminEmail,
        password: hashedPassword,
        systemPassword: plainPassword,
        role: "Super Admin", 
        roleId: role.id,
        departmentId: department.id,
        designation: employee.designation,
        assignedLocationId: location.id,
        active: true,
      },
    });

    console.log("Super Admin User created successfully.");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${plainPassword}`);

  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
};

resetDatabase();
