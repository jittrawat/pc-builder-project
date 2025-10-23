import React, { createContext, useContext, useMemo, useState } from "react";

const BuildContext = createContext(null);
export const useBuild = () => useContext(BuildContext);

export const CATEGORIES = ["cpu","mainboard","ram","gpu","ssd","case","cooler","power","hdd"];

export function BuildProvider({ children }) {
  const [selected, setSelected] = useState({});
  const [lastUpdatedCat, setLastUpdatedCat] = useState(null);

  const setPart = (cat, item, { keepQty = true } = {}) =>
    setSelected(prev => {
      const qty = keepQty && prev[cat]?.qty ? prev[cat].qty : 1;
      setLastUpdatedCat(cat);
      return { ...prev, [cat]: { item, qty } };
    });

  const removePart = (cat) =>
    setSelected(prev => {
      const n = { ...prev };
      delete n[cat];
      setLastUpdatedCat(cat);
      return n;
    });

  const incQty = (cat) =>
    setSelected(prev => {
      if (!prev[cat]) return prev;
      setLastUpdatedCat(cat);
      return { ...prev, [cat]: { ...prev[cat], qty: (prev[cat].qty || 1) + 1 } };
    });

  const decQty = (cat) =>
    setSelected(prev => {
      if (!prev[cat]) return prev;
      setLastUpdatedCat(cat);
      return { ...prev, [cat]: { ...prev[cat], qty: Math.max(1, (prev[cat].qty || 1) - 1) } };
    });

  const reset = () => {
    setSelected({});
    setLastUpdatedCat(null);
  };

  const total = useMemo(
    () => Object.values(selected).reduce((s, { item, qty }) => s + (item?.price || 0) * (qty || 1), 0),
    [selected]
  );

  return (
    <BuildContext.Provider
      value={{ selected, setPart, removePart, incQty, decQty, reset, total, lastUpdatedCat }}
    >
      {children}
    </BuildContext.Provider>
  );
}
