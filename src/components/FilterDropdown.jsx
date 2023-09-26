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

  return (
    <div className="row">
      <select value={values[name]} onChange={onChangeHandler}>
        {optionsObject[name].map((item) => {
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
