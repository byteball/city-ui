import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { getRefDataFromSearch } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

export const useApplyRefData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const inited = useSettingsStore((state) => state.inited);
  const existedRefData = useSettingsStore((state) => state.refData);
  const setRefData = useSettingsStore((state) => state.setRefData);

  useEffect(() => {
    if (!inited) return;

    if (!existedRefData) {
      const refData = getRefDataFromSearch(location.search);
      setRefData(refData);
      return;
    }

    console.log("log(useApplyRefData): ref data already exists", existedRefData);

    const searchParams = new URLSearchParams(location.search);
    let needClean = false;
    const paramsToClean = ["ref", "ref_plot_num"];

    paramsToClean.forEach((param) => {
      if (searchParams.has(param)) {
        searchParams.delete(param);
        needClean = true;
      }
    });

    if (needClean) {
      navigate({ ...location, search: searchParams.toString() }, { replace: true });
    }
  }, [location, existedRefData, setRefData, inited, navigate]);
};

