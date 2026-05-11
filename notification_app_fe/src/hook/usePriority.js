import { useState, useEffect, useCallback } from "react";
import { getPriorityNotifications } from "../api/notificationApi";
import { feLog } from "../middleware/loggingMiddleware";

function usePriority() {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async function () {
    setLoading(true);
    setError(null);

    try {
      const data = await getPriorityNotifications();
      let list = [];
      if (data.priorityNotifications) list = data.priorityNotifications;

      setItems(list);
      setTotalCount(data.totalConsidered || 0);
      feLog("info", "hook", "priority loaded: " + list.length + " items");
    } catch (e) {
      setError(e.message);
      feLog("error", "hook", "priority failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    load();
  }, [load]);

  return {
    items: items,
    totalCount: totalCount,
    loading: loading,
    error: error,
    reload: load,
  };
}

export default usePriority;
