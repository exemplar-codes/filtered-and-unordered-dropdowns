import { useState, useEffect, useMemo } from "react";
import MOCK_DATA from "../data.json";

import FilterDropdown from "../components/FilterDropdown";

/**
 * Goal: Generate all possibilities given a nested object.
 *
 * @param {Object | Array } nestedObject Object of objects with multiple keys, with leaf values being array of non objects
 *
 * general form { a: {b: { d: ....{ someKey: ['stringOrNumberSomething_not_object'], ... }, ... }, ... }, ... }
 *
 * example:
 *  ```js
 *  {
 *      Singapore: {local: ['SGD', 'AED'], swift: ['USD', CAD']},
 *      India: {local: ['INR', 'NPR'], swift: ['SGD', USD']}
 *  }
 *  ```
 *
 *
 * @param {Array<String>} keys - in the output, name of key to be used in each object of output
 *
 * @returns {Array<Object>} All possibilities derivable from input. Simple array of Objects, no nesting.
 *
 * Example:
 *  input
 *  ```js
 *  nestedObj = {local: ['SGD', 'AED'], swift: ['USD', CAD']}
 *  keys = ['method', 'currency']}
 *  ```
 *  output
 *  ```js
 *  [
 *    { method: local, currency: 'SGD' },
 *    { method: local, currency: 'AED' },
 *    { method: swift, currency: 'USD' },
 *    { method: swift, currency: 'CAD' }
 *  ]
 *  ```
 *
 * Metrics - Time O(n^d), Space O(n), Output size O(n^d) , DX: fixed lines of code to add/remove if dropdown is added/removed, since it's recursive.
 */
function generateAllPossibleNodesFromNestedObject(nestedObject, keys) {
  const currentKeyName = keys[0];
  if (Array.isArray(nestedObject)) {
    // ['SGD', 'AED'], ['currency'] => [{currency: 'SGD'}, { currency: 'AED'}]

    return nestedObject.map((value) => ({
      [currentKeyName]: value,
    }));
  }

  // we are an object
  //   input: {local: ['SGD', 'AED'], swift: ['USD', CAD']}, ['method', 'currency']} =>
  //  output: [{ method: local, currency: 'SGD' }, { method: local, currency: 'AED' }, { method: swift, currency: 'USD' }, { method: swift, , currency: 'CAD' }]

  const currentLevelKeyValuePairs = Object.entries(nestedObject);
  console.log({ currentLevelKeyValuePairs });

  const allDescendantsWithCurrentLevelAdded = currentLevelKeyValuePairs.map(
    ([currentLevelKey, currentLevelDescendants]) => {
      // currentLevelKey is 'local',  currentLevelChildren: ['SGD', 'AED']
      //   descendants all possiblity array
      const descendantsNodeArray = generateAllPossibleNodesFromNestedObject(
        currentLevelDescendants,
        keys.slice(1)
      ); // eq [{currency: 'SGD'}, { currency: 'AED'}]

      //  add self to all descendants
      return descendantsNodeArray.map((item) =>
        // item is {currency: 'SGD'} => { method: local, currency: 'SGD'}
        ({ [currentKeyName]: currentLevelKey, ...item })
      ); // eq [{ method: local, currency: 'SGD' }, { method: local, currency: 'AED' }]
    }
  );

  // since all descendants (recur call is an array, and we call map on each), we get array of arrays. Example (see below)
  // type, allNodesIncludingCurrentLevel   [[{ method: local, currency: 'SGD' }, { method: local, currency: 'AED' }], [{ method: swift, currency: 'USD' }, { method: swift, , currency: 'CAD' }]]
  // but since all have the same number of keys, we can combine them to form a single array.

  const allDescendantsAtOneLevelWithCurrentLevelAdded =
    allDescendantsWithCurrentLevelAdded.flat();

  return allDescendantsAtOneLevelWithCurrentLevelAdded;
}

export default function FeatApproach2() {
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
    // Iterative - Space O(d), Time O(n^d), DX: have to more code by hand, if dropdowns are add/removed.
    // [{name1, name2, name3}]

    // const countriesWithExtraData = Object.entries(MOCK_DATA);

    // const innerData_ = countriesWithExtraData.reduce((accum, countryItem) => {
    //   const countryCode = countryItem[0];
    //   const methodsWithExtraData = Object.entries(countryItem[1]);

    //   const pmAndCurrencyObjects = methodsWithExtraData.reduce(
    //     (accum, item) => {
    //       const paymentMethod = item[0];
    //       const currencies = item[1];

    //       return accum.concat(
    //         currencies.map((currency) => ({
    //           currency,
    //           method: paymentMethod,
    //         }))
    //       );
    //     },
    //     []
    //   );

    //   return accum.concat(
    //     pmAndCurrencyObjects.map((item) => ({ ...item, country: countryCode }))
    //   );
    // }, []);

    // return innerData_;

    // use recursion. assume structure = {AE: { local: ['x']}}, ['country', 'method', 'currency'] => '[{country: AE, method: local, currency: x}]'
    const data = MOCK_DATA;
    const fields = Object.keys(form);

    return generateAllPossibleNodesFromNestedObject(data, fields);
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
      <a href="https://github.com/exemplar-codes/filtered-and-unordered-dropdowns/blob/main/src/pages/FeatApproach2.jsx">
        <pre>FeatApproach2.jsx (recursive)</pre>
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
