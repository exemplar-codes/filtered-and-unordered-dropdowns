import { useState } from "react";
import MOCK_DATA from "../data.json";

import Dropdown from "../components/Dropdown";
import { useEffect } from "react";

export default function Feat() {
  const [form, setForm] = useState({
    country: null,
    method: null,
    currency: null,
  });

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(MOCK_DATA);
  }, []);

  return (
    <div>
      FeatReal
      <p>
        <em>{data ? "Got data ✅ " : "Data absent ❌"}</em>
      </p>
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
