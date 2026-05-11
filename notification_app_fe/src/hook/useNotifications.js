import { useEffect, useCallback } from "react";
import { getNotifications } from "../api/notificationApi";
import { useNotifState, useNotifDispatch } from "../state/notificationContext.jsx";
import { feLog } from "../middleware/loggingMiddleware";

function useNotifications() {
  const state = useNotifState();
  const dispatch = useNotifDispatch();

  const load = useCallback(async function () {
    dispatch({ type: "LOADING" });

    try {
      const data = await getNotifications({
        page: state.page,
        limit: state.pageSize,
        notificationType: state.filter,
      });

      let list = [];
      if (data.notifications) list = data.notifications;
      else if (Array.isArray(data)) list = data;

      dispatch({
        type: "LOADED",
        payload: { notifications: list, count: data.count || data.total || list.length },
      });

      setTimeout(function () {
        const ids = list.map(function (n) { return n.id || n.ID; });
        dispatch({ type: "VIEWED", payload: ids });
      }, 2000);

      feLog("info", "hook", "loaded " + list.length + " notifications");
    } catch (e) {
      dispatch({ type: "ERROR", payload: e.message });
      feLog("error", "hook", "load failed: " + e.message);
    }
  }, [state.page, state.filter, state.pageSize, dispatch]);

  useEffect(function () {
    load();
  }, [load]);

  function changePage(num) {
    dispatch({ type: "PAGE", payload: num });
  }

  function changeFilter(val) {
    dispatch({ type: "FILTER", payload: val });
  }

  return {
    notifications: state.items,
    totalCount: state.total,
    currentPage: state.page,
    isLoading: state.loading,
    error: state.error,
    activeFilter: state.filter,
    viewedIds: state.viewed,
    changePage: changePage,
    changeFilter: changeFilter,
    refresh: load,
  };
}

export default useNotifications;
