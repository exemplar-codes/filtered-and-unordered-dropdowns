export default function Dropdown({
  value = "bob",
  name = "Hello",
  setValue = () => {},
  options = [
    { label: "Alice", value: "alice" },
    { label: "Bob", value: "bob" },
  ],
}) {
  const onChangeHandler = (event) => {
    const key = name;
    const value = event.target.value;

    setValue((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <select value={value} onChange={onChangeHandler}>
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
