import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DatePicker, Button, Modal } from "@gw/web-basic-components";
import {
  GWProTable,
  SearchGroup,
  usePageTab,
  usePermissions,
} from "@gw/web-business-components";
import { ITbaleRef } from "@gw/web-business-components/lib/table-pro/dto";
import {
  PERMISSION_KEYS,
  downloadWithRes,
  getMoment,
  useRequest,
  valid,
} from "@/utils";
import { Tabs } from "@/components";
import { useUpdateEffect } from "@/hooks";
import {
  ALARM_TABS,
  ALARM_TABS_MAP_KEY,
  disabledAfter,
  handlePageQuery,
} from "./utils";
import { Refresh } from "./components";
import { useAlarmCols } from "./hooks";
import type { Alarm, AlarmRes, AlarmsReq } from "./dto";

function List() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const level = searchParams.get("level")?.split(",") || [];
  const types = searchParams.get("types")?.split(",") || [];
  const [initFlag, setInitFlag] = useState(true);
  // console.log("types", types.split(","));

  /**
   * 是否批量解除
   */
  const isBatchResolve = useRef(false);
  /** 加载时立即创建tab */
  usePageTab({ name: "告警列表", componentId: "alarm-list" });
  /** 提升模态框状态 */
  const [rowBtn, setRowBtn] = useState("");

  /**
   * 当前告警或历史告警tab
   */
  const [resolvedFlag, setResolvedFlag] = useState<boolean>();

  /**
   * 选中行的集合
   */
  const [selectedAlarmRows, setSelectedAlarmRows] = useState<Alarm[]>([]);
  /**
   * table实体
   */
  const tableRef = useRef<ITbaleRef>(null);
  /**
   * 导出的条件
   */
  const exportRef = useRef<any>(null);
  /**
   * 获取列表分页接口
   */
  const [{ data: alarmListData, loading: alarmListLoading }, fetchAlarmList] =
    useRequest<AlarmsReq, AlarmRes>(api.workingAlarm.index);
  /**
   * 导出
   */
  const [{ loading: exportLoading }, fetchExport] = useRequest(
    api.workingAlarm.export
  );

  /**
   * tab切换重新获取数据
   */
  useUpdateEffect(() => {
    if (typeof resolvedFlag === "undefined") return;
    // setSelectedAlarmRows([]);
    // tableRef.current?.forceUpdate("columns");
    // tableRef.current?.refresh();
  }, [resolvedFlag]);

  /** 行操作点击回调 */
  const onRowBtnClick = (
    key: string,
    id: string,
    dId: string,
    record: Alarm
  ) => {};

  /** 告警列表的表头配置 */
  const columns = useAlarmCols(onRowBtnClick, resolvedFlag, types, level);

  /**
   * 获取用户权限
   */
  const [permissionList] = usePermissions();

  /**
   * 列表选择配置
   */
  const rowSelection = {
    columnWidth: "4rem",
    selectedRowKeys: [],
    onSelect: (record, seleted) => {},
    onSelectAll: (seleted, _, changeRows) => {},
  };

  const handleExport = async () => {
    Modal.confirm({
      title: "是否确认全部导出",
      okText: "确定",
      onOk: async () => {
        const res = await fetchExport(
          {
            ...exportRef.current,
            current: 1,
            size: alarmListData?.total,
          },
          {
            responseType: "blob",
          }
        );
        downloadWithRes(res);
      },
      cancelText: "取消",
    });
  };

  return (
    <>
      <GWProTable
        ref={tableRef}
        rowKey="alarmId"
        advancedSearch
        searchConfig={{
          tooltipTitle: "搜索包含字段范围",
          tooltipContent: "电站名称、设备名称/SN或故障名称",
          placeholder: "请输入关键字搜索",
          column: "keyword",
          matchType: "Like",
          matchValue: "",
          allowClear: true,
        }}
        defaultSearchValue={(e) => {
          return {};
        }}
        searchGroupOptions={{
          mutex: [],
        }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={alarmListData?.dataList}
        fetchPage={(e) => {
          const payload = {
            resolvedFlag: resolvedFlag,
          };

          fetchAlarmList(payload).then(() => setInitFlag(false));
        }}
        loading={alarmListLoading}
        pagination={{
          pageSize: alarmListData?.size ?? 10,
          total: alarmListData?.total,
          current: alarmListData?.current,
        }}
        renderTableAbove={({ InnerSearch, AdvancedSearch }, { onSubmit }) => {
          return (
            <div className={styles["filter-wrapper"]}>
              <div className={styles["top-container"]}>
                <SearchGroup.Item keyPath={"resolvedFlag"}>
                  <Tabs
                    keyMap={ALARM_TABS_MAP_KEY}
                    activeKey={resolvedFlag ? "resolved" : "unresolved"}
                    items={ALARM_TABS}
                    onTabClick={(v) => {
                      setResolvedFlag(v === "resolved");
                    }}
                  />
                </SearchGroup.Item>
                {InnerSearch}
                <SearchGroup.Item
                  keyPath={["queryConditions", 7, "matchValue"]}
                >
                  <DatePicker.RangePicker
                    onChange={onSubmit}
                    disabledDate={disabledAfter}
                  />
                </SearchGroup.Item>
                {AdvancedSearch}
                <Button
                  loading={exportLoading}
                  type="primary"
                  onClick={handleExport}
                >
                  导出
                </Button>
                <Refresh onClick={onSubmit} />
              </div>
            </div>
          );
        }}
      />
    </>
  );
};

export default List;
