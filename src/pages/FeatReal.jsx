import { useState } from "react";
import Dropdown from "../components/Dropdown";

export default function Feat() {
  const [form, setForm] = useState({
    country: null,
    method: null,
    currency: null,
  });

  return (
    <div>
      FeatReal
      <p>
        <span>Country&nbsp;</span>
        <Dropdown setValues={setForm} values={form} name="country" />
      </p>
      <p>
        <span>Method&nbsp;</span>
        <Dropdown setValues={setForm} values={form} name="method" />
      </p>
      <p>
        <span>Currency&nbsp;</span>
        <Dropdown setValues={setForm} values={form} name="currency" />
      </p>
    </div>
  );
}
