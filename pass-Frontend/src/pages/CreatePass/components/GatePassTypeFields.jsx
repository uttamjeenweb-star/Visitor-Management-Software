
import { FormField } from "@/shared/ui/molecules/FormField";
import { Input } from "@/shared/ui/atoms/Input";

export const GatePassTypeFields = ({ formData, handleInputChange }) => {
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className="form-grid-2">
      <FormField label="Gate Pass Type" htmlFor="gatepass-type-single">
        <div className="form-radio-group">
          {["single", "multi"].map((type) => (
            <label key={type} className="form-radio-label" htmlFor={`gatepass-type-${type}`}>
              <input
                type="radio"
                id={`gatepass-type-${type}`}
                name="gatePassType"
                value={type}
                checked={formData.gatePassType === type}
                onChange={handleInputChange}
                className="form-radio-input"
              />
              <span className="form-radio-text">
                {type === "single" ? "Single Day" : "Multi Day"}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Pass Date" htmlFor="pass-date">
        <Input
          type="date"
          id="pass-date"
          name="passDate"
          value={formData.passDate}
          onChange={handleInputChange}
          min={today}
        />
      </FormField>

      {formData.gatePassType === "multi" && (
        <>
          <FormField label="From" htmlFor="from">
            <Input
              type="date"
              id="from"
              name="from"
              disabled={formData.gatePassType !== "multi"}
              value={formData.from}
              onChange={handleInputChange}
              min={today}
            />
          </FormField>
          <FormField label="To" htmlFor="to">
            <Input
              type="date"
              id="to"
              name="to"
              disabled={formData.gatePassType !== "multi"}
              value={formData.to}
              onChange={handleInputChange}
              min={formData.from || today}
            />
          </FormField>
        </>
      )}
    </div>
  );
};
