export default function Dropdown({
  values = "bob",
  name = "Hello",
  setValues = () => {},
  options = [
    { label: "Alice", value: "alice" },
    { label: "Bob", value: "bob" },
  ],
}) {
  const onChangeHandler = (event) => {
    const key = name;
    const value = event.target.value;

    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <select value={values[name]} onChange={onChangeHandler}>
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
