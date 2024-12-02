import React, { useContext, useState } from "react";

import { TimePicker } from "antd";

const { RangePicker } = TimePicker;

const TimeRangePicker = ({ value, onChange }) => {
  return (
    <RangePicker
      value={value}
      onChange={onChange}
      format="HH:mm" // Optional: specify the date format
    />
  );
};

export default TimeRangePicker;
