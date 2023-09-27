import { useEffect } from "react";

/**
 * This is one of the dropdown, in a series of dropdowns that are dependent
 */
export default function FilterDropdown({
  values = "bob",
  name = "hello",
  setValues = () => {},
  optionsObject = {
    hello: [
      { label: "Alice", value: "alice" },
      { label: "Bob", value: "bob" },
    ],
  },

  labelKey = "label",
  valueKey = "value",
}) {
  const onChangeHandler = (event) => {
    const key = name;
    const value = event.target.value;

    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // prepend 'Select' (should be first option)
  const propOptions = optionsObject[name];
  const options_ = [{ label: "Select", value: "" }].concat(propOptions);

  useEffect(() => {
    if (propOptions.length === 1) {
      const item = propOptions[0];
      const value = item[valueKey] ?? item;
      console.log("Single auto select", value, propOptions);
      onChangeHandler({ target: { value: value } });
    }
  }, [propOptions.length, JSON.stringify(propOptions[0])]);
  // dep1 - single value detect, update
  // dep2 - handle case where no value exists but first element doesn't change, should update.

  return (
    <div className="row">
      <select value={values[name]} onChange={onChangeHandler}>
        {options_.map((item) => {
          const value_ = item[valueKey] ?? item;
          const label_ = item[labelKey] ?? item;
          return (
            <option key={value_} value={value_}>
              {label_}
            </option>
          );
        })}
      </select>
      <span>Count: {optionsObject[name].length}</span>
      <button
        type="button"
        onClick={() => onChangeHandler({ target: { value: "" } })}
      >
        🗑️
      </button>
    </div>
  );
}
