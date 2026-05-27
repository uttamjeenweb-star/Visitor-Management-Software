
import React, { useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/molecules/Card";
import { queryPost } from "@/shared/services/api";
import { API_ENDPOINTS } from "@/shared/const/api";
import { useLocationUtils } from "@/shared/hooks/useLocation";
import { CameraInput } from "@/shared/ui/molecules/CameraInput";

import { useEmployees } from "@/features/employee/useEmployee";
import { usePurpose } from "@/features/purpose/usePurpose";
import { useCarryWith } from "@/features/carry_with/useCarrywith";
import { useVisitorArea } from "@/features/visitor_area/useVisitorArea";
import { useVisitorType } from "@/features/visitor_type/useVisitorType";
import { useLocation } from "@/features/location/useLocation";
import { useIdType } from "@/features/id_type/useIdType";

import { GatePassTypeFields } from "./components/GatePassTypeFields";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { VisitDetailsSection } from "./components/VisitDetailsSection";
import { AccompanyingPersonsSection } from "./components/AccompanyingPersonsSection";
import { VisitAreaSection } from "./components/VisitAreaSection";
import { PurposeSection } from "./components/PurposeSection";

const INITIAL_FORM_DATA = {
  gatePassType: "single",
  passDate: "",
  from: "",
  to: "",
  mobileNo: "",
  name: "",
  emailId: "",
  companyName: "",
  address: "",
  state: "",
  city: "",
  representingVisitorType: "",
  subLocation: "",
  toMeetWith: "",
  carryWith: [],
  idType: "PASSPORT",
  idNumber: "",
  description: "",
  maskCovid: "",
  persons: [{ name: "", phoneNo: "", aadharNumber: "", aadharFile: null }],
  visitArea: [],
  purpose: "",
  allowedHours: "",
};

const CreatePassPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { states, cities, setSelectedState } = useLocationUtils();
  const { employees } = useEmployees();
  const { carryWith } = useCarryWith();
  const { purposes } = usePurpose();
  const { visitorArea } = useVisitorArea();
  const { visitorType } = useVisitorType();
  const { location } = useLocation();
  const { idType } = useIdType();
  const cameraInputRef = React.useRef(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonChange = (index, field, value) => {
    setFormData((prev) => {
      const newPersons = [...prev.persons];
      newPersons[index] = { ...newPersons[index], [field]: value };
      return { ...prev, persons: newPersons };
    });
  };

  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      persons: [
        ...prev.persons,
        { name: "", phoneNo: "", aadharNumber: "", aadharFile: null },
      ],
    }));
  };

  const removePerson = (index) => {
    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== index),
    }));
  };

  const handleClear = () => {
    setFormData(INITIAL_FORM_DATA);
    cameraInputRef.current?.resetCamera();
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    setSelectedState(value);
    setFormData((prev) => ({
      ...prev,
      state: value,
      city: "",
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailId && !emailRegex.test(formData.emailId)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.mobileNo)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.passDate < today) {
      alert("Pass date cannot be in the past.");
      return;
    }
    if (formData.gatePassType === "multi") {
      if (formData.from < today || formData.to < today) {
        alert("From and To dates cannot be in the past.");
        return;
      }
      if (formData.to < formData.from) {
        alert("To date cannot be earlier than From date.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Capture photo
      const photoBlob = await cameraInputRef.current?.takePhoto();
      if (!photoBlob) {
        alert("Please take a photo before submitting!");
        setIsSubmitting(false);
        return;
      }
      // 2. Build FormData
      const payload = new FormData();
      // ── Scalar fields ──────────────────────────────────────────────────────
      const scalarFields = [
        "gatePassType",
        "passDate",
        "from",
        "to",
        "mobileNo",
        "name",
        "emailId",
        "companyName",
        "address",
        "state",
        "city",
        "representingVisitorType",
        "subLocation",
        "toMeetWith",
        "idType",
        "idNumber",
        "description",
        "maskCovid",
        "purpose",
        "allowedHours",
      ];
      scalarFields.forEach((key) => {
        payload.append(key, formData[key]);
      });
      // ── carryWith & visitArea: string[] → JSON string ──────────────────────
      payload.append("carryWith", JSON.stringify(formData.carryWith));
      payload.append("visitArea", JSON.stringify(formData.visitArea));
      // ── Persons: send metadata as JSON + each file separately ──────────────
      const personsMetadata = formData.persons.map(({ ...rest }) => rest);
      payload.append("persons", JSON.stringify(personsMetadata));
      // Append each person's aadhar file with a predictable key
      formData.persons.forEach((person, index) => {
        if (person.aadharFile) {
          payload.append(
            `aadharFile_${index}`,
            person.aadharFile,
            person.aadharFile.name,
          );
        }
      });
      // ── Camera photo ───────────────────────────────────────────────────────
      payload.append("photo", photoBlob, "visitor-photo.jpg");
      // 3. POST
      const response = await queryPost(API_ENDPOINTS.UPLOAD, payload);
      console.log("API Response:", response.data);
      alert("Gate pass created successfully!");
      handleClear();
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        error?.response?.data?.message ||
        "Submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle>Create Gate Pass</CardTitle>
        </CardHeader>
        <CardContent className="page-card-content">
          <form onSubmit={handleSubmit} className="form-container">
            <GatePassTypeFields
              formData={formData}
              handleInputChange={handleInputChange}
            />

            <PersonalInfoSection
              formData={formData}
              handleInputChange={handleInputChange}
              handleStateChange={handleStateChange}
              states={states}
              cities={cities}
            />

            <VisitDetailsSection
              formData={formData}
              handleInputChange={handleInputChange}
              visitorType={visitorType}
              location={location}
              employees={employees}
              carryWith={carryWith}
              idType={idType}
              setFormData={setFormData}
            />

            <AccompanyingPersonsSection
              formData={formData}
              handlePersonChange={handlePersonChange}
              removePerson={removePerson}
              addPerson={addPerson}
            />

            <VisitAreaSection
              formData={formData}
              visitorArea={visitorArea}
              setFormData={setFormData}
            />

            <PurposeSection
              formData={formData}
              handleInputChange={handleInputChange}
              purposes={purposes}
            />

            <div className="form-section">
              <h3 className="form-section-title-mb">Visitor Photo</h3>
              <CameraInput
                ref={cameraInputRef}
                width="400px"
                height="300px"
                onCapture={() => {}}
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-danger px-8 py-2"
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary px-8 py-2"
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePassPage;
