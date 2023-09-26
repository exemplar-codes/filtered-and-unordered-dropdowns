import { useState } from "react";
import MOCK_DATA from "../data.json";

import FilterDropdown from "../components/FilterDropdown";
import { useEffect } from "react";
import { useMemo } from "react";

export default function FeatReal() {
  const [form, setForm] = useState({
    country: null,
    method: null,
    currency: null,
  });

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(MOCK_DATA);
  }, []);

  const allPossibleNodes = useMemo(() => {
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

  const relevantValues = useMemo(() => {
    // internalData.filter by filled values
    // return {name1: [''], name2: [''], name3: ['']}

    const fields = Object.entries(form);

    // relevantValues_
    return fields.reduce((accum, [formField, formFieldFilledValue]) => {
      // example: key=country, value='SG'

      // Find relevant nodes from alll possible list
      let relevantNodesForField = null; // internalData filtered according to currently filled values
      relevantNodesForField = allPossibleNodes.filter((node) => {
        const nodeEntries = Object.entries(node);
        return nodeEntries.every(([nodeField, nodeValue]) => {
          // nodeField === formField
          if (nodeField !== formField) {
            const filledValue = form[nodeField];
            if (!filledValue) return true; // unfilled. doesn't take part in filtering
            return filledValue === nodeValue; // filled, should match (since we have internalData all possibilities)
          } else {
            // self field, can't filter
            return true;
          }
        });
      });

      // Combine all relevant nodes' field values, remove duplicates
      const relevantValuesForField = new Set(
        relevantNodesForField.map((item) => item[formField])
      );

      // 3. finally, return the relevant values (strings) as array
      accum[formField] = [...relevantValuesForField];

      return accum;
    }, {});
  }, [form]);

  console.log({
    allPossibleNodes_length: allPossibleNodes.length,
    allPossibleNodes: allPossibleNodes,
  });

  console.log({ relevantValues });

  return (
    <div>
      <p className="row">
        <span>Country&nbsp;</span>
        <FilterDropdown
          setValues={setForm}
          values={form}
          name="country"
          optionsObject={relevantValues}
        />
      </p>
      <p className="row">
        <span>Method&nbsp;</span>
        <FilterDropdown
          setValues={setForm}
          values={form}
          name="method"
          optionsObject={relevantValues}
        />
      </p>
      <p className="row">
        <span>Currency&nbsp;</span>
        <FilterDropdown
          setValues={setForm}
          values={form}
          name="currency"
          optionsObject={relevantValues}
        />
      </p>
      <hr />
      <a href="https://github.com/exemplar-codes/filtered-and-unordered-dropdowns/blob/main/src/pages/FeatReal.jsx">
        <pre>FeatReal.jsx</pre>
      </a>
      <p>
        <em>{data ? "Got data ✅ " : "Data absent ❌"}</em>
      </p>
      <details>
        <summary>Time, space, DX</summary>
        <ul style={{ textAlign: "left" }}>
          <li>
            Initial generation time O(n<sup>d</sup>)
          </li>
          <li>
            onSelect time O(n<sup>d-1</sup>)
          </li>
          <li>
            Memory: O(n<sup>d</sup>)
          </li>
          <li>DX: addition/removal of fields will require code changes</li>
        </ul>
      </details>
    </div>
  );
}
