import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const resetMasterData = async () => {
  try {
    console.log("Starting master data reset (Targeted tables only)...");

    // Disable foreign key checks
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);

    // Truncate specific tables
    const tablesToClear = [
      'User', 
      'Employee', 
      'Department', 
      'Location', 
      'CompanyRegister', 
      'Permission', 
      'Role'
    ];

    for (const table of tablesToClear) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`Truncated table: ${table}`);
    }

    // Enable foreign key checks
    await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
    console.log("Targeted tables cleared successfully.");

    // Define Master Data based on screenshots
    
    // 1. Company Registration
    await prisma.companyRegister.create({
      data: {
        id: "default",
        companyFullName: "JeenWeb",
        companyShortName: "JeenWeb",
        companyContactNo: "9824465778",
        hostName: "JeenWeb",
        portNo: 5000,
        userEmailId: "superadmin@gmail.com",
        emailPassword: "Password@123",
        startTime: "09:00",
        endTime: "19:00"
      }
    });
    console.log("Created Company Registration.");

    // 2. Locations
    const locMain = await prisma.location.create({ data: { name: "Main HQ", description: "Primary Headquarters", status: "active" } });
    const locBranch = await prisma.location.create({ data: { name: "office Branch", description: "Branch 1", status: "active" } });
    console.log("Created Locations.");

    // 3. Roles & Permissions
    // Module lists based on screenshot
    const allModules = ["Department", "CarryWith", "IdType", "Report", "Dashboard", "Print", "VisitingArea", "Role", "Location", "Employee", "VisitorType", "CompanyRegister", "Purpose"];
    const adminModules = ["Employee", "VisitorType", "Purpose", "IdType", "Report", "VisitingArea", "Print", "Location", "Dashboard", "CarryWith", "Department"];
    const securityModules = ["Print", "Report", "Dashboard"];
    const managerModules = ["Dashboard", "Print", "Report", "Employee"];
    const employeeModules = ["Dashboard"];

    const generatePermissions = (modulesToInclude) => modulesToInclude.map(module => ({
        module, canRead: true, canCreate: true, canUpdate: true, canDelete: true, 
        dashboardActions: module === 'Dashboard' ? {
          check_in: true, check_out: true, print: true, view_detail: true, create_pass: true, approve: true, reject: true,
          view_requested_list: true, view_pending_approval_list: true, view_rejected_list: true, view_approved_list: true,
          view_inside_list: true, view_multi_day_list: true, view_exited_list: true, view_expired_list: true,
        } : (module === 'Report' ? { view: true, export: true } : (module === 'Print' ? { print_setting: true, print: true } : {}))
    }));

    const superAdminRole = await prisma.role.create({
      data: { name: "Super Admin", weight: 100, dataScope: "global", permissions: { create: generatePermissions(allModules) } }
    });
    const adminRole = await prisma.role.create({
      data: { name: "Admin", weight: 80, dataScope: "global", permissions: { create: generatePermissions(adminModules) } }
    });
    const securityRole = await prisma.role.create({
      data: { name: "Security", weight: 20, dataScope: "global", permissions: { create: generatePermissions(securityModules) } }
    });
    const managerRole = await prisma.role.create({
      data: { name: "Manager", weight: 50, dataScope: "departmental", permissions: { create: generatePermissions(managerModules) } }
    });
    const employeeRole = await prisma.role.create({
      data: { name: "Employee", weight: 10, dataScope: "persona", permissions: { create: generatePermissions(employeeModules) } }
    });
    console.log("Created Roles.");

    // 4. Departments (Create without managers first)
    const deptNames = ["Finance", "Guard", "Legal", "Sales", "HEADQUARTERS", "HR", "IT", "Marketing"];
    const depts = {};
    for (const name of deptNames) {
      depts[name] = await prisma.department.create({ data: { name, status: "active" } });
    }
    console.log("Created Departments.");

    // 5. Employees and Users
    const plainPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const employeeDataList = [
      { id: "FIN001", name: "rutika", dept: "Finance", role: managerRole, loc: locMain, email: "rutika@gmail.com" },
      { id: "IT003", name: "luv", dept: "IT", role: employeeRole, loc: locBranch, email: "luv@gmail.com" },
      { id: "MAR001", name: "sahil", dept: "Marketing", role: managerRole, loc: locMain, email: "sahil@gmail.com" },
      { id: "SAL001", name: "yash", dept: "Sales", role: managerRole, loc: locMain, email: "yash@gmail.com" },
      { id: "IT001", name: "sanjay", dept: "IT", role: adminRole, loc: locMain, email: "sanjay@gmail.com" },
      { id: "HR001", name: "kangna", dept: "HR", role: managerRole, loc: locMain, email: "kangna@gmail.com" },
      { id: "GUA001", name: "manish", dept: "Guard", role: securityRole, loc: locMain, email: "manish@gmail.com" },
      { id: "LEG001", name: "yuvi", dept: "Legal", role: managerRole, loc: locMain, email: "yuvi@gmail.com" },
      { id: "IT002", name: "bhisma", dept: "IT", role: managerRole, loc: locMain, email: "bhisma@gmail.com" },
      { id: "HEA001", name: "Super Administrator", dept: "HEADQUARTERS", role: superAdminRole, loc: locMain, email: "superadmin@gmail.com" },
    ];

    const employees = {};

    for (const data of employeeDataList) {
      const deptRecord = depts[data.dept];
      
      const emp = await prisma.employee.create({
        data: {
          employeeId: data.id,
          name: data.name,
          department: deptRecord.name,
          departmentId: deptRecord.id,
          designation: data.role.name, // using role name as designation for simplicity
          email: data.email,
          status: "active",
          roleId: data.role.id,
          assignedLocationId: data.loc.id
        }
      });
      employees[data.name] = emp;

      await prisma.user.create({
        data: {
          name: emp.name,
          email: data.email,
          password: hashedPassword,
          systemPassword: plainPassword,
          role: data.role.name, 
          roleId: data.role.id,
          departmentId: deptRecord.id,
          designation: emp.designation,
          assignedLocationId: data.loc.id,
          active: true,
        }
      });
    }
    console.log("Created Employees and Users.");

    // 6. Set Department Managers
    const managerMapping = {
      "Finance": "rutika",
      "Guard": "manish",
      "Legal": "yuvi",
      "Sales": "yash",
      "HEADQUARTERS": "Super Administrator",
      "HR": "kangna",
      "IT": "sanjay", // In screenshot sanjay is listed as IT manager
      "Marketing": "sahil"
    };

    for (const [deptName, managerName] of Object.entries(managerMapping)) {
      if (employees[managerName]) {
        await prisma.department.update({
          where: { id: depts[deptName].id },
          data: { managerEmployeeId: employees[managerName].id }
        });
      }
    }
    console.log("Set Department Managers.");

    console.log("Master data reset completed successfully!");

  } catch (error) {
    console.error("Error resetting master data:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
};

resetMasterData();
