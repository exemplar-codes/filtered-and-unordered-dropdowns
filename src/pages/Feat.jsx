import { useState } from "react";
import FilterDropdown from "../components/FilterDropdown";

export default function Feat() {
  const [form, setForm] = useState({
    country: null,
    method: null,
    currency: null,
  });

  return (
    <div>
      Feat
      <p>
        <span>Country&nbsp;</span>
        <FilterDropdown setValues={setForm} values={form} name="country" />
      </p>
      <p>
        <span>Method&nbsp;</span>
        <FilterDropdown setValues={setForm} values={form} name="method" />
      </p>
      <p>
        <span>Currency&nbsp;</span>
        <FilterDropdown setValues={setForm} values={form} name="currency" />
      </p>
    </div>
  );
}
