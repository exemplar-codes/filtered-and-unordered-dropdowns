import { useState } from "react";
import MOCK_DATA from "../data.json";

import Dropdown from "../components/Dropdown";
import { useEffect } from "react";
import { useMemo } from "react";

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

  const internalData = useMemo(() => {
    // [{name1, name2, name3}]

    const countriesWithExtraData = Object.entries(MOCK_DATA);

    const innerData_ = countriesWithExtraData.reduce((accum, countryItem) => {
      const countryCode = countryItem[0];
      const methodsWithExtraData = Object.entries(countryItem[1]);

      const pmAndCurrencyObjects = methodsWithExtraData.reduce(
        (accum, item) => {
          const paymentMethod = item[0];
          const currencies = item[1];

          return accum.concat(
            currencies.map((currency) => ({
              currency,
              method: paymentMethod,
            }))
          );
        },
        []
      );

      return accum.concat(
        pmAndCurrencyObjects.map((item) => ({ ...item, country: countryCode }))
      );
    }, []);

    return innerData_;
  }, [MOCK_DATA]);

  console.log({ internalData: internalData.length });
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
