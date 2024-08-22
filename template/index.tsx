import classNames from "classnames";
import React from "react";
import styles from "./index.module.less";

/**
 * 自定义弹窗标题
 */
function Templat(props: any) {
  const { className } = props;

  return (
    <div className={classNames(styles.container, props.className)}>
    </div>
  );
};

export default Templat;
