import * as React from "react"
import { DayModifiers, DayPickerProps, LocaleUtils } from "react-day-picker";

const currentYear = new Date().getFullYear();
export const fromMonth = new Date(currentYear, 0);
export const toMonth = new Date(currentYear + 10, 11);

export const DayPickerCaption = ({ date, locale, onChange }: {
  date: Date,
  locale: LocaleUtils,
  onChange: (date: Date) => void,
}) => {
  const months = locale.getMonths();

  const years = [];
  for (let i = fromMonth.getFullYear(); i <= toMonth.getFullYear(); i += 1) {
    years.push(i);
  }

  const handleChange = (e) => {
    const { year, month } = e.target.form;
    onChange(new Date(year.value, month.value));
  };

  return (
    <form className="DayPicker-Caption">
      <select name="month" onChange={handleChange} value={date.getMonth()} style={{border:"black 1px solid"}}>
        {months.map((month, i) => (
          <option key={month} value={i}>
            {month}
          </option>
        ))}
      </select>
      <select name="year" onChange={handleChange} value={date.getFullYear()} style={{border:"black 1px solid"}}>
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </form>
  );
}