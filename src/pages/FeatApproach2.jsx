import { useState, useEffect, useMemo } from "react";
import MOCK_DATA from "../data.json";

import FilterDropdown from "../components/FilterDropdown";

/**
 * Goal: Generate all possibilities given a nested object.
 * Generally used with `getRelevantValuesFromAllPossibleNodes`.
 * Tip: this is an expensive function. cache it (useMemo for example).
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
 * Metrics - Time O(n^d), Space O(n + d), Output size O(n^d) , DX: fixed lines of code to add/remove if dropdown is added/removed, since it's recursive.
 *
 * Example code:
 * ```js
 * const allPossibleValues = cache_generateAllPossibleNodesFromNestedObject(data_nested_object, fields_array)
 * const formObject = someStateObject;
 * const relevantValues = generateAllPossibleNodesFromNestedObject(cache_generateAllPossibleNodesFromNestedObject, formObject);
 *
 * <Dropdown name="field1" options={relevantValues.field1.map()} />
 * <Dropdown name="field2" options={relevantValues.field2.map()} />
 * ```
 */
export const generateAllPossibleNodesFromNestedObject = (
  nestedObject,
  keys
) => {
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
  // console.log({ currentLevelKeyValuePairs });

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
  // type, allNodesIncludingCurrentLevel
  // example
  //  [
  //    [{ method: local, currency: 'SGD' }, { method: local, currency: 'AED'   }],
  //    [{ method: swift, currency: 'USD' }, { method: swift, , currency: 'CAD' }]
  // ]
  // but since all have the same number of keys, we can combine them to form a single array.

  const allDescendantsAtOneLevelWithCurrentLevelAdded =
    allDescendantsWithCurrentLevelAdded.flat();

  return allDescendantsAtOneLevelWithCurrentLevelAdded;
};

/**
 * Get relevant values, i.e. filtered values based on filled dropdown values. From all possible values.
 * Generally used with `generateAllPossibleNodesFromNestedObject`.
 * Don't cache this, it should run on every dropdown change (useEffect w.r.t formObject for example).
 *
 * @param {Array<Object>} allPossibleNodes array of simple objects (flat). Only dropdown field names should be present here.
 * example [{ country: 'SG', method: 'local', currency: 'SGD' }, { country: 'US', method: 'swift', currency: 'CAD' }]
 *
 * @param {Object} formObject simple (flat object) containing field names and current values(or optionally functions)
 * example: { country: 'SG', method: 'local', currency: 'SGD'}. unfilled values are OK too, { country: 'SG', method: '', currency: ''}
 *
 * @param {Object} formObjectCriterias
 * `formObjectCriteria` is an optional. You can pass a "match criteria" function that determines "revevant or not",
 *  instead of the default (exact match or unfilled)
 *
 *  Usage is simple, just pass key (same as formObject key) and value a function.
 *  This will override the formObject value criteria (i.e. exact match or unfilled).
 *
 *  Criteria function: params 'possibleValue, currentlyFilledValue' as param and must return boolean (true means possibility is relevant).
 *    Additionally, the defaultCriteria is passed as third criteria - in case you want to skip custom criteria
 *
 *  Just to be clear, the default match function (if you pass string, and don't use this variation) is exact match or unfilled value.
 *
 *  Example:
 *    formObject={ country: 'SG', method: 'local', currency: 'SGD'}
 *    formObjectCriteria={ method: (possibleValue, currentlyFilledValue, defaultCriteriaFunc=) => { return boolean } }
 *
 * ---
 *
 * @returns {Object} keys are field names, and values are simple arrays (*values* for dropdown).
 * example: { country: ['IN', 'US', 'CA', 'AE'], method: ['local', 'swift'],  currency: ['INR', 'USD' , 'CAD', 'SGD', 'AED']}
 *
 * Used with `generateAllPossibleNodesFromNestedObject`
 *
 * Example code:
 * ```js
 * const allPossibleValues = cache_generateAllPossibleNodesFromNestedObject(data_nested_object, fields_array)
 * const formObject = someStateObject;
 * const relevantValues = generateAllPossibleNodesFromNestedObject(cache_generateAllPossibleNodesFromNestedObject, formObject);
 *
 * <Dropdown name="field1" options={relevantValues.field1.map()} />
 * <Dropdown name="field2" options={relevantValues.field2.map()} />
 * ```
 */
export const getRelevantValuesFromAllPossibleNodes = (
  allPossibleNodes,
  formObject,
  formObjectCriterias = null
) => {
  // internalData.filter by filled values
  // return {name1: [''], name2: [''], name3: ['']}
  const fieldsAndFilledValues = Object.entries(formObject);

  // relevantValues_
  // doing `.reduce` since we need an object
  return fieldsAndFilledValues.reduce(
    (accum, [formField, formFieldFilledValue]) => {
      // example: key=country, value='SG'

      // Find relevant nodes from alll possible list
      // internalData filtered according to currently filled values
      const relevantNodesForField = allPossibleNodes.filter((node) => {
        // since we want a list of countries (as per example) from nodes
        // we should ignore 'country', and filter out other keys (of node) w.r.t filled values

        const nodeEntries = Object.entries(node);
        return nodeEntries.every(([nodeField, nodeValue]) => {
          if (nodeField === formField) return true; // self, ignore

          // the field is something other than current key ('country')
          // try to match with filled value
          const filledValue = formObject[nodeField];
          if (!filledValue) return true; // unfilled. doesn't take part in filtering

          const defaultCriteria = (possibilityValue, filledValue_) =>
            possibilityValue === filledValue_; // default criteria, exact match

          const criteriaFunction = formObjectCriterias?.[nodeField];
          if (!criteriaFunction) return defaultCriteria(nodeValue, filledValue);

          return criteriaFunction(nodeValue, filledValue, defaultCriteria);
        });
      });

      // Combine all relevant nodes' field values, remove duplicates
      const relevantValuesForField = new Set(
        relevantNodesForField.map((item) => item[formField])
      );

      // 3. finally, return the relevant values (strings) as array
      accum[formField] = [...relevantValuesForField];

      return accum;
    },
    {}
  );
};

export default function FeatApproach2() {
  const [form, setForm] = useState({
    country: "",
    method: "",
    currency: "",
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

    // NEW: use recursion. assume structure = {AE: { local: ['x']}}, ['country', 'method', 'currency'] => '[{country: AE, method: local, currency: x}]'
    const data = MOCK_DATA;
    const fields = Object.keys(form);

    return generateAllPossibleNodesFromNestedObject(data, fields);
  }, [MOCK_DATA]);

  const relevantValues = useMemo(() => {
    return getRelevantValuesFromAllPossibleNodes(allPossibleNodes, form);
  }, [form, allPossibleNodes]);

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
          <li>Space: O(n+ d)</li>
          <li>
            Output size: O(n<sup>d</sup>)
          </li>
          <li>
            DX: addition/removal of fields requires very little frontend change
          </li>
        </ul>
      </details>
    </div>
  );
}
