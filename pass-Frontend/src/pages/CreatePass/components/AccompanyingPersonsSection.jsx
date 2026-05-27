
import { FormField } from "@/shared/ui/molecules/FormField";
import { Input } from "@/shared/ui/atoms/Input";
import { Button } from "@/shared/ui/atoms/Button";

export const AccompanyingPersonsSection = ({
  formData,
  handlePersonChange,
  removePerson,
  addPerson,
}) => {
  return (
    <div className="form-section">
      <h3 className="form-section-title-mb">Person Details</h3>
      {formData.persons.map((person, index) => (
        <div key={index} className="person-card">
          <div className="form-grid-4">
            <FormField label="Person Name" htmlFor={`person-name-${index}`}>
              <Input
                id={`person-name-${index}`}
                name={`person[${index}].name`}
                type="text"
                autoComplete="name"
                value={person.name}
                onChange={(e) => handlePersonChange(index, "name", e.target.value)}
              />
            </FormField>
            <FormField label="Person Phone No" htmlFor={`person-phone-${index}`}>
              <Input
                id={`person-phone-${index}`}
                name={`person[${index}].phoneNo`}
                type="tel"
                autoComplete="tel"
                value={person.phoneNo}
                onChange={(e) => handlePersonChange(index, "phoneNo", e.target.value)}
              />
            </FormField>
            <FormField label="Aadhar Number" htmlFor={`person-aadhar-${index}`}>
              <Input
                id={`person-aadhar-${index}`}
                name={`person[${index}].aadharNumber`}
                type="text"
                autoComplete="off"
                value={person.aadharNumber}
                onChange={(e) => handlePersonChange(index, "aadharNumber", e.target.value)}
              />
            </FormField>
            <FormField label="Aadhar File" htmlFor={`file-${index}`}>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id={`file-${index}`}
                  name={`person[${index}].aadharFile`}
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handlePersonChange(index, "aadharFile", e.target.files?.[0] || null)
                  }
                />
                <label htmlFor={`file-${index}`} className="form-file-label">
                  {person.aadharFile ? person.aadharFile.name : "Choose File"}
                </label>
                {formData.persons.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePerson(index)}
                    className="person-remove-btn"
                  >
                    X
                  </Button>
                )}
              </div>
            </FormField>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addPerson} className="person-add-btn">
        + Add Person
      </Button>
    </div>
  );
};
